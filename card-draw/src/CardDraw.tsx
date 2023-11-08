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
	const debug = false;

	const chartarr: Chart[] = [];
	const numToDraw = 7;

	// Current card draw state
	const [spread, setSpread] = useState<Chart[]>([])
	const [range, setRange] = useState<number[]>([1, 11])
	const [eligibleCharts, setEligibleCharts] = useState<number[][]>([[], []]) // [0] -> can be drawn, [1] -> removed from pool in no replacement draws
	const [protectOrder, setProtectOrder] = useState<number>(0)

	// Modal will open when chart's ID matches this state
	const [modalOpened, setModalOpened] = useState<number>(-1)

	// fuck this lol, only way i can think of trying to tell Card that a new draw happened without lifting cardState up
	const [numDraw, setNumDraw] = useState<number>(0)

	const [noRP, setNoRP] = useState<boolean>(true)

	// init
	useEffect(() => {
		let chartIds: number[] = []
		// Chart IDs remaining in the pool
		for (let i = 0; i < chartarr.length; i++) {
			chartIds[i] = i
		}
		setEligibleCharts([chartIds, []])
	}, [])

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

	function swapIndices(a: number, b: number, array: number[]) {
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

		// Change eligible IDs to be within range
		let chartIds: number[] = []
		let chartsInRange: Chart[] = chartarr.filter((chart) => {
			return chart["tier"] >= a && chart["tier"] <= b
		})
		chartsInRange.forEach((chart) => {
			chartIds.push(chart.id)
		})
		setEligibleCharts([chartIds, []])
	}

	// Draw n number of charts from the available pool
	// could have probably just done this without converting charts to ids, but lol whatever
	function draw() {
		let chartIds: number[] = eligibleCharts[0]
		// Fisher-Yates shuffle
		for (let i = chartIds.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartIds);
		}

		let spentIds: number[] = [...eligibleCharts[1]]
		const drawnIds: number[] = []
		// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
		// caveat with this algo - when this is the case, the remaining charts will always show up first in the draw. idk if that's a huge issue, lol
		if (chartIds.length < numToDraw) {
			// Shuffle spent charts
			for (let i = spentIds.length - 1; i >= 0; i--) {
				swapIndices(i, getRandomInt(i), spentIds);
			}
			// Reset chartIds and spentIds
			chartIds = [...chartIds, ...spentIds]
			spentIds = []
		}

		// Draw n charts, add those charts to the spent pool
		for (let i = 0; i < numToDraw; i++) {
			drawnIds[i] = chartIds[i]
			if (noRP) spentIds.push(drawnIds[i])
		}

		// Remove IDs from eligible pool
		if (noRP) chartIds.splice(0, numToDraw)

		// Get actual chart metadata from drawn IDs
		const drawnCharts: Chart[] = []
		drawnIds.forEach((id) => {
			// This sucks man i hate O(n^2)
			// but i'm not working with 10000 charts so it's ok :^)
			const chartMatch: Chart[] = chartarr.filter(chart => {
				return chart["id"] === id
			})
			drawnCharts.push(chartMatch[0])
		})

		// lol
		setEligibleCharts([chartIds, spentIds])
		setSpread(drawnCharts)
		setModalOpened(-1)
		setProtectOrder(0)
		setNumDraw(numDraw + 1)
	}

	// This is fucking stupid, i don't know what i'm doing
	function redraw(id: number) {
		// Find index of chart to redraw
		let ind: number = -1
		for (let i = 0; i < spread.length; i++) {
			if (spread[i].id === id) ind = i
		}

		let chartIds: number[] = eligibleCharts[0]
		let nextChartId: number;
		let spentIds: number[] = eligibleCharts[1]

		// Get the next chart in line
		if (noRP) { // Redraw with no replacement enabled
			// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
			if (chartIds.length === 0) {
				// Get current draw
				let spreadIds: number[] = []
				spread.forEach((chart) => {
					spreadIds.push(chart["id"])
				})
				console.log(spreadIds)

				// Set spentIds to charts already in the spread and chartIds to everything else
				chartIds = spentIds
				chartIds = chartIds.filter((id) => {
					return !spreadIds.includes(id)
				})
				spentIds = spentIds.filter((id) => {
					if (spreadIds.includes(id)) console.log(id)
					return spreadIds.includes(id)
				})

				// Shuffle eligible charts
				for (let i = chartIds.length - 1; i >= 0; i--) {
					swapIndices(i, getRandomInt(i), chartIds);
				}
			}
			nextChartId = chartIds[0] // Get the next chart, which is the very next chart in the eligible list
			chartIds.splice(0, 1) // Remove chart from eligible charts
			spentIds.push(nextChartId) // Add the drawn chart to the spent pool
		} else { // Redraw without replacement
			nextChartId = chartIds[spread.length] // Get the next chart, which is directly after the initial n charts drawn in the list
			chartIds.splice(spread.length, 1) // Remove that chart
			chartIds.splice(ind, 1, nextChartId) // Add it to the intended spot
			chartIds.push(id) // Add the old chart to the end
		}

		// Get chart metadata from ID
		const chartMatch: Chart[] = chartarr.filter(chart => {
			return chart["id"] === nextChartId
		})

		// Splice new chart into spread
		let newSpread: Chart[] = spread
		newSpread.splice(ind, 1, chartMatch[0])

		// Set everything again oh god
		setModalOpened(-1)
		setEligibleCharts([chartIds, spentIds])
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
				{eligibleCharts[0].map((num) => {
					let chart: Chart[] = chartarr.filter(chart => {
						return chart["id"] === num
					})
					return (<p>{chart[0].title}</p>)
				})}
				<h1 className="modal-text-major text-p2">nah</h1>
				{eligibleCharts[1].map((num) => {
					let chart: Chart[] = chartarr.filter(chart => {
						return chart["id"] === num
					})
					return (<p>{chart[0].title}</p>)
				})}
			</>}
		</>
	)
}
export default CardDraw