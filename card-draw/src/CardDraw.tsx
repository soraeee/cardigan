import chartJSON from './pack.json'
import { useState, useEffect } from 'react';
import './index.css'
import './reset.css'
import Card from './Card';

function CardDraw() {

	interface Chart {
		id: number;
		title: string;
		subtitle: string;
		artist: string;
		difficulty: number;
		difficultyslot: string;
		displaybpm: number[];
		bpmstring: string;
		tier: number;
		nocmod: boolean;
		gfxPath: string;
		hasGfx: boolean;
	}

	// Toggle to see eligible/used card pools
	const debug = true;

	// All charts from the JSON file
	const chartarr: Chart[] = [];
	const numToDraw = 7;

	// Current card draw state
	const [spread, setSpread] = useState<Chart[]>([])
	const [range, setRange] = useState<number[]>([1, 11])
	const [eligibleCharts, setEligibleCharts] = useState<Chart[][]>([[], []]) // [0] -> can be drawn, [1] -> removed from pool in no replacement draws
	const [protectOrder, setProtectOrder] = useState<number>(0)

	// Modal will open when chart's ID matches this state
	const [modalOpened, setModalOpened] = useState<number>(-1)

	// fuck this lol, only way i can think of trying to tell Card that a new draw happened without lifting cardState up
	const [numDraw, setNumDraw] = useState<number>(0)

	const [noRP, setNoRP] = useState<boolean>(true)

	// init
	useEffect(() => {
		populateCharts()
		setEligibleCharts([chartarr, []])
	}, [])

	function populateCharts() {
		// Process chart metadata to something that we actually need
		chartJSON.charts.forEach(chart => {
			{
				// Convert "[Txx] name" format into a Tier value
				const tier: number = Number(chart.title.substring(2, 4))
				// Use transliterated titles if available
				const songtitle: string = (chart.titletranslit != "") ? chart.titletranslit.substring(6, chart.titletranslit.length) : chart.title.substring(6, chart.title.length)
				const songartist: string = (chart.artisttranslit != "") ? chart.artisttranslit : chart.artist
				const songsubtitle: string = (chart.subtitletranslit != "") ? chart.subtitletranslit : chart.subtitle

				let displaybpmFormatted = ""
				if (chart.displaybpm[0] === chart.displaybpm[1]) {
					displaybpmFormatted = String(Math.round(chart.displaybpm[0]))
				} else {
					displaybpmFormatted = chart.displaybpm[0] + " - " + chart.displaybpm[1]
				}

				let hasGfx = false
				if (chart.gfxPath != "") hasGfx = true

				// Add properly formatted metadata to array
				chartarr.push({
					id: Number(chart.sid),
					title: songtitle.replace(/\(No CMOD\)/, "").trim(),
					artist: songartist,
					subtitle: songsubtitle,
					difficulty: chart.difficulties[0].difficulty,
					difficultyslot: chart.difficulties[0].slot,
					displaybpm: chart.displaybpm,
					bpmstring: displaybpmFormatted,
					tier: tier,
					nocmod: /\(No CMOD\)/.test(songtitle),
					gfxPath: chart.gfxPath,
					hasGfx: hasGfx,
				})
			}
		});
	}

	// There's probably a cleaner way to do this
	populateCharts()

	function swapIndices(a: number, b: number, array: any[]) {
		const c = array[a]
		array[a] = array[b]
		array[b] = c
	}

	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}

	// Change draw range
	function changeDrawRange(a: number, b: number) {
		// clamp a, b to [0, 11]
		const min = 0
		const max = 11
		a = Math.min(Math.max(a, min), b)
		b = Math.min(Math.max(b, a), max)

		setRange([a, b])

		// Change eligible charts to be within range
		let chartsInRange: Chart[] = chartarr.filter((chart) => {
			if (chart["tier"] >= a && chart["tier"] <= b) return chart
		})
		setEligibleCharts([chartsInRange, []])
	}

	// Draw n number of charts from the available pool
	function draw() {
		let chartPool: Chart[] = eligibleCharts[0]
		// Fisher-Yates shuffle
		for (let i = chartPool.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartPool);
		}

		let spentCharts: Chart[] = [...eligibleCharts[1]]
		const drawnCharts: Chart[] = []
		// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
		// caveat with this algo - when this is the case, the remaining charts will always show up first in the draw. idk if that's a huge issue, lol
		if (chartPool.length < numToDraw) {
			// Shuffle spent charts
			for (let i = spentCharts.length - 1; i >= 0; i--) {
				swapIndices(i, getRandomInt(i), spentCharts);
			}
			// Reset chartIds and spentIds
			chartPool = [...chartPool, ...spentCharts]
			spentCharts = []
		}

		// Draw n charts, add those charts to the spent pool
		for (let i = 0; i < numToDraw; i++) {
			drawnCharts[i] = chartPool[i]
			if (noRP) spentCharts.push(drawnCharts[i])
		}

		// Remove IDs from eligible pool
		if (noRP) chartPool.splice(0, numToDraw)

		// lol
		setEligibleCharts([chartPool, spentCharts])
		setSpread(drawnCharts)
		setModalOpened(-1)
		setProtectOrder(0)
		setNumDraw(numDraw + 1)
	}

	// This is fucking stupid, i don't know what i'm doing
	function redraw(id: number) {
		// Find index of chart to redraw
		let ind: number = -1
		let oldChart: Chart = spread[0]; // shut up typescript
		for (let i = 0; i < spread.length; i++) {
			if (spread[i].id === id) {
				ind = i
				oldChart = spread[i]
			}
		}

		let chartPool: Chart[] = eligibleCharts[0]
		let nextChart: Chart;
		let spentCharts: Chart[] = eligibleCharts[1]

		// Get the next chart in line
		if (noRP) { // Redraw with no replacement enabled
			// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
			if (chartPool.length === 0) {
				// Get current draw
				let spreadCharts: Chart[] = spread

				// Set spentIds to charts already in the spread and chartIds to everything else
				chartPool = spentCharts
				chartPool = chartPool.filter((chart) => {
					return !spreadCharts.includes(chart)
				})
				spentCharts = spentCharts.filter((chart) => {
					return spreadCharts.includes(chart)
				})

				// Shuffle eligible charts
				for (let i = chartPool.length - 1; i >= 0; i--) {
					swapIndices(i, getRandomInt(i), chartPool);
				}
			}
			nextChart = chartPool[0] // Get the next chart, which is the very next chart in the eligible list
			chartPool.splice(0, 1) // Remove chart from eligible charts
			spentCharts.push(nextChart) // Add the drawn chart to the spent pool
		} else { // Redraw without replacement
			nextChart = chartPool[spread.length] // Get the next chart, which is directly after the initial n charts drawn in the list
			chartPool.splice(spread.length, 1) // Remove that chart
			chartPool.splice(ind, 1, nextChart) // Add it to the intended spot
			chartPool.push(oldChart) // Add the old chart to the end
		}

		// Splice new chart into spread
		let newSpread: Chart[] = spread
		newSpread.splice(ind, 1, nextChart)

		// Set everything again oh god
		setModalOpened(-1)
		setEligibleCharts([chartPool, spentCharts])
		setSpread(newSpread)
	}

	// Reset card draw
	// Useful for no replacement draws
	function reset() {
		setEligibleCharts([[...eligibleCharts[0], ...eligibleCharts[1]], []])
		setSpread([])
		setModalOpened(-1)
		setProtectOrder(0)
	}

	// Reset removed pool and toggle no replacement setting
	function changeNoRP(value: boolean) {
		setNoRP(value)
		setEligibleCharts([[...eligibleCharts[0], ...eligibleCharts[1]], []])
	}

	return (
		<>
			<div className="header">
				<button onClick={draw} className="button">Draw</button>
				<button onClick={reset} className="button">Reset</button>
				{/* Probably want to seperate this out into a sidebar or something, lol */}
				{/* Could be slightly better - input is a bit jank, could have a "Set" button. dunno */}

				<div className="settings">
					<input type="checkbox" name="norp" id="norp" value="norp-enabled" onChange={(e) => { changeNoRP(e.target.checked) }} defaultChecked={noRP} />
					<p>Enable no replacement draws</p>
				</div>
				<div className="settings">
					<input type="number" min="1" step="1" max="11" value={range[0]} onChange={e => { changeDrawRange(Number(e.currentTarget.value), range[1]) }} />
					<input type="number" min="1" step="1" max="11" value={range[1]} onChange={e => { changeDrawRange(range[0], Number(e.currentTarget.value)) }} />
				</div>
			</div>
			{/* Show message when no card draw is present */}
			<div className="cardDisplay">
				{spread.length === 0 && <div className="nodraw">
					<img src="nodraw.png" className="nodraw-img" />
					<p className="nodraw-text">No charts currently drawn :o</p>
					<p className="nodraw-text-sub">Press "Draw" for a new set of charts</p>
				</div>}
				{spread.map((chart) => {
					return (<Card key={chart.id}
						chart={chart}

						modalOpened={modalOpened}
						setModalOpened={setModalOpened}

						spread={spread}
						setSpread={setSpread}

						protectOrder={protectOrder}
						setProtectOrder={setProtectOrder}

						numDraw={numDraw}
						redraw={redraw} />)
				})}
			</div>
			{debug && <>
				<h1 className="modal-text-major text-p1">yea</h1>
				{eligibleCharts[0].map((chart) => {
					return (<p>{chart.title}</p>)
				})}
				<h1 className="modal-text-major text-p2">nah</h1>
				{eligibleCharts[1].map((chart) => {
					return (<p>{chart.title}</p>)
				})}
			</>}
		</>
	)
}
export default CardDraw