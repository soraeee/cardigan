import chartJSON from './assets/rip135-assets/pack.json'
import { useState } from 'react';
import './App.css'
import './index.css'

function CardDraw() {

	interface Chart {
		id: number;
		title: string;
		artist: string;
		difficulty: Number;
		displaybpm: String[]; // fuck off
		tier: Number;
	}

	const chartarr: Chart[] = [];
	const numToDraw = 7;

	// Current card draw state
	const [spread, setSpread] = useState<number[]>([])

	// Process chart metadata to something that we actually need
	chartJSON.charts.forEach(chart => {
		{
			// Convert "[Txx] name" format into a Tier value
			let tier: Number = Number(chart.title.substring(2, 4))
			// Use transliterated titles if available
			let songtitle: string = (chart.titletranslit != "") ? chart.titletranslit : chart.title
			let songartist: string = (chart.artisttranslit != "") ? chart.artisttranslit : chart.artist

			// Add properly formatted metadata to array
			chartarr.push({
				id: Number(chart.sid),
				title: songtitle,
				artist: songartist,
				difficulty: Number(chart.difficulties[0].difficulty),
				displaybpm: chart.displaybpm,
				tier: tier,
			})
		}
	});

	// Chart IDs remaining in the pool
	// Todo: reduce this to selected tiers
	let chartIds: number[] = []
	for (let i = 0; i < chartarr.length; i++) {
		chartIds[i] = i
	}


	function swapIndices(a: number, b: number, array: number[]) {
		let c = array[a]
		array[a] = array[b]
		array[b] = c
	}

	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}


	function draw() {
		// Fisher-Yates shuffle
		for (let i = chartIds.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartIds);
		}

		let drawnIds: number[] = []
		for (let i = 0; i < numToDraw; i++) {
			drawnIds[i] = chartIds[i]
			// todo: remove the id from chartIds once finished. probably need to replace chartIds[i] with chartIds[0] when doing that
		}
		setSpread(drawnIds)
	}

	return (
		<>
			<div className="header">
				<button onClick={draw} className="button">Draw</button>
			</div>
			<div className="cards">
				{chartarr.filter((chart) => {
					if (spread.includes(chart["id"])) return chart
				}).map((chart) => {
					return <div key={chart.id}>{chart.title}</div>
				})}
			</div>
		</>
	)
}
export default CardDraw