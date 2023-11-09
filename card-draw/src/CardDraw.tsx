import chartJSON from './pack.json'
import { useState, useEffect } from 'react';
import './index.css';
import './reset.css';
import Card from './Card';
import NumberField from './NumberField';

function CardDraw() {

	interface Chart {
		id:				number;
		title:			string;
		subtitle:		string;
		artist:			string;
		difficulty:		number;
		difficultyslot:	string;
		displaybpm:		number[];
		bpmstring:		string;
		tier:			number;
		nocmod:			boolean;
		gfxPath:		string;
		hasGfx:			boolean;
	}

	// Toggle to see eligible/used card pools
	const debug = false;

	// All charts from the JSON file
	const chartarr: Chart[] = [];

	const defaultNumToDraw = 7;
	const [defaultMin, defaultMax] = [1, 11];

	// Current card draw state
	const [numToDraw, setNumToDraw] = useState<number>(defaultNumToDraw);
	const [spread, setSpread] = useState<Chart[]>([]);
	const [range, setRange] = useState<number[]>([defaultMin, defaultMax]);
	const [eligibleCharts, setEligibleCharts] = useState<Chart[][]>([[], []]); // [0] -> can be drawn, [1] -> removed from pool in no replacement draws
	const [protectOrder, setProtectOrder] = useState<number>(0);

	// Modal will open when chart's ID matches this state
	const [modalOpened, setModalOpened] = useState<number>(-1);

	// fuck this lol, only way i can think of trying to tell Card that a new draw happened without lifting cardState up
	const [updateCard, setupdateCard] = useState<number>(0);

	const [noRP, setNoRP] = useState<boolean>(true);

	// init
	useEffect(() => {
		//populateCharts();
		setEligibleCharts([chartarr, []]);
	}, []);

	// Gets transliterated string, if available
	const translit = (chart: {[index: string]:any}, prop: string) => {
		return (chart[`${prop}translit`] != "") ? chart[`${prop}translit`] : chart[`${prop}`];
	}

	// Rounds number and converts to a string
	const strround = (n: number) => String(Math.round(n));

	const populateCharts = () => {
		// Process chart metadata to something that we actually need
		chartJSON.charts.forEach(chart => {
			{
				// Convert "[Txx] name" format into a Tier value
				const tier: number = Number(chart.title.match(/\[T(\d{1,2})\]\s?/)![1]);

				const songtitle: string = translit(chart, "title").replace(/\[T\d{1,2}\]\s?/, "");
				const songartist: string = translit(chart, "artist");
				const songsubtitle: string = translit(chart, "subtitle");

				let displaybpmFormatted = strround(chart.displaybpm[0]);
				if (chart.displaybpm[0] !== chart.displaybpm[1]) {
					displaybpmFormatted += " - " + strround(chart.displaybpm[1]);
				}

				const hasGfx = chart.gfxPath != "";

				// Add properly formatted metadata to array
				chartarr.push({
					id:				Number(chart.sid),
					title:			songtitle.replace(/\(No CMOD\)/, "").trim(),
					artist:			songartist,
					subtitle:		songsubtitle,
					difficulty:		chart.difficulties[0].difficulty,
					difficultyslot:	chart.difficulties[0].slot,
					displaybpm:		chart.displaybpm,
					bpmstring:		displaybpmFormatted,
					tier:			tier,
					nocmod:			/\(No CMOD\)/.test(songtitle),
					gfxPath:		chart.gfxPath,
					hasGfx:			hasGfx,
				});
			}
		});
	}

	populateCharts();

	const swapIndices = (a: number, b: number, array: any[]) => {
		const c = array[a];
		array[a] = array[b];
		array[b] = c;
	}

	const getRandomInt = (max: number) => Math.floor(Math.random() * max);

	const changeDrawRange = (a: number, b: number) => {
		setRange([a, b]);

		// Change eligible charts to be within range
		const chartsInRange: Chart[] = chartarr.filter(chart => {
			if (chart["tier"] >= a && chart["tier"] <= b) return chart
		})
		setEligibleCharts([chartsInRange, []]);
	}

	// Draw n number of charts from the available pool
	const draw = () => {
		let chartPool: Chart[] = eligibleCharts[0]
		let spentCharts: Chart[] = [...eligibleCharts[1]];

		// Don't explode when there aren't enough charts to draw
		if (chartPool.length + spentCharts.length < numToDraw) {
			console.log("Not enough charts to draw!")
			return
		};

		// Fisher-Yates shuffle
		for (let i = chartPool.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartPool);
		}

		const drawnCharts: Chart[] = [];
		// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
		// caveat with this algo - when this is the case, the remaining charts will always show up first in the draw. idk if that's a huge issue, lol
		if (chartPool.length < numToDraw) {
			// Shuffle spent charts
			for (let i = spentCharts.length - 1; i >= 0; i--) {
				swapIndices(i, getRandomInt(i), spentCharts);
			}
			// Reset chartIds and spentIds
			chartPool = [...chartPool, ...spentCharts];
			spentCharts = [];
		}

		// Draw n charts, add those charts to the spent pool
		for (let i = 0; i < numToDraw; i++) {
			drawnCharts[i] = chartPool[i];
			if (noRP) spentCharts.push(drawnCharts[i]);
		}

		// Remove IDs from eligible pool
		if (noRP) chartPool.splice(0, numToDraw);

		// lol
		setEligibleCharts([chartPool, spentCharts]);
		setSpread(drawnCharts);
		setModalOpened(-1);
		setProtectOrder(0);
		setupdateCard(updateCard + 1);
	}

	// This is fucking stupid, i don't know what i'm doing
	const redraw = (id: number) => {
		// Find index of chart to redraw
		let ind: number = -1;
		let oldChart: Chart = spread[0]; // shut up typescript
		for (let i = 0; i < spread.length; i++) {
			if (spread[i].id === id) {
				ind = i;
				oldChart = spread[i];
			}
		}

		let chartPool: Chart[] = eligibleCharts[0];
		let nextChart: Chart;
		let spentCharts: Chart[] = eligibleCharts[1];

		// Get the next chart in line
		if (noRP) { // Redraw with no replacement enabled
			// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
			if (chartPool.length === 0) {
				// Get current draw
				const spreadCharts: Chart[] = spread;

				// Set spentIds to charts already in the spread and chartIds to everything else
				chartPool = spentCharts
				chartPool = chartPool.filter(chart => !spreadCharts.includes(chart));
				spentCharts = spentCharts.filter(chart => spreadCharts.includes(chart));

				// Shuffle eligible charts
				for (let i = chartPool.length - 1; i >= 0; i--) {
					swapIndices(i, getRandomInt(i), chartPool);
				}
			}
			nextChart = chartPool[0]; // Get the next chart, which is the very next chart in the eligible list
			chartPool.splice(0, 1); // Remove chart from eligible charts
			spentCharts.push(nextChart); // Add the drawn chart to the spent pool
		} else { // Redraw without replacement
			nextChart = chartPool[spread.length]; // Get the next chart, which is directly after the initial n charts drawn in the list
			chartPool.splice(spread.length, 1); // Remove that chart
			chartPool.splice(ind, 1, nextChart); // Add it to the intended spot
			chartPool.push(oldChart); // Add the old chart to the end
		}

		// Splice new chart into spread
		const newSpread: Chart[] = spread;
		newSpread.splice(ind, 1, nextChart);

		// Set everything again oh god
		setModalOpened(-1);
		setEligibleCharts([chartPool, spentCharts]);
		setSpread(newSpread);
	}

	// Reset card draw
	// Useful for no replacement draws
	const reset = () => {
		setEligibleCharts([[...eligibleCharts[0], ...eligibleCharts[1]], []]);
		setSpread([]);
		setModalOpened(-1);
		setProtectOrder(0);
	}

	// Reset removed pool and toggle no replacement setting
	const changeNoRP = (value: boolean) => {
		setNoRP(value)
		setEligibleCharts([[...eligibleCharts[0], ...eligibleCharts[1]], []])
	}

	return (<>
		<div className="header">
			<div className="settings">
				<NumberField desc="# to draw" initValue={defaultNumToDraw} min={1} max={Infinity} onChange={(n: number) => { setNumToDraw(n) }}/>
				<NumberField desc="Tier min." initValue={range[0]} min={defaultMin} max={range[1]} onChange={(n: number) => { changeDrawRange(n, range[1])}} />
				<NumberField desc="Tier max." initValue={range[1]} min={range[0]} max={defaultMax} onChange={(n: number) => { changeDrawRange(range[0], n)}} />
				<div className="settings-checkbox">
					<p className="checkbox-label">Dupe protection</p>
					<input className="checkbox-input" type="checkbox" name="norp" id="norp" value="norp-enabled" onChange={(e) => { changeNoRP(e.target.checked) }} defaultChecked={noRP}/>
				</div>
			</div>
			<div className="actions">
				<button onClick={draw} className="action-draw">Draw</button>
				<button onClick={reset} className="action-reset">Reset</button>
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
				return (<Card
					key				= {chart.id}
					chart			= {chart}
					modalOpened		= {modalOpened}
					setModalOpened	= {setModalOpened}
					spread			= {spread}
					setSpread		= {setSpread}
					protectOrder	= {protectOrder}
					setProtectOrder	= {setProtectOrder}
					updateCard		= {updateCard}
					redraw			= {redraw}
				/>)
			})}
		</div>
		{debug && <>
			<div className="debug">
				<div className="debug-detail">
					<p className="text-p1">yea ({eligibleCharts[0].length})</p>
					{eligibleCharts[0].map(chart => <span>{chart.title}, </span>)}
				</div>
				<div className="debug-detail">
					<p className="text-p2">nah ({eligibleCharts[1].length})</p>
					{eligibleCharts[1].map(chart => <span>{chart.title}, </span>)}
				</div>
			</div>
		</>}
	</>)
}
export default CardDraw