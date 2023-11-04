import chartJSON from './pack.json'
import { useState } from 'react';
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

	const chartarr: Chart[] = [];
	const numToDraw = 7;

	// Current card draw state
	const [spread, setSpread] = useState<Chart[]>([])

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

	// Chart IDs remaining in the pool
	// Todo: reduce this to selected tiers
	const chartIds: number[] = []
	for (let i = 0; i < chartarr.length; i++) {
		chartIds[i] = i
	}

	function swapIndices(a: number, b: number, array: number[]) {
		const c = array[a]
		array[a] = array[b]
		array[b] = c
	}

	function getRandomInt(max: number) {
		return Math.floor(Math.random() * max);
	}

	// Draw n number of charts from the available pool
	function draw() {
		// Fisher-Yates shuffle
		for (let i = chartIds.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartIds);
		}

		const drawnIds: number[] = []
		for (let i = 0; i < numToDraw; i++) {
			drawnIds[i] = chartIds[i]
			// todo: remove the id from chartIds once finished. probably need to replace chartIds[i] with chartIds[0] when doing that
		}
		const drawnCharts: Chart[] = []
		drawnIds.forEach((id) => {
			// This sucks man i hate O(n^2)
			// but i'm not working with 10000 charts so it's ok :^)
			const chartMatch: Chart[] = chartarr.filter(chart => {
				return chart["id"] === id
			})
			drawnCharts.push(chartMatch[0])
		})
		setSpread(drawnCharts)
	}

	// todo: split cards into its own component
	return (
		<>
			<div className="header">
				<button onClick={draw} className="button">Draw</button>
			</div>
			<div className="cardDisplay">
				{spread.map((chart) => {
					return(<Card chart = {chart}/>)
				})}
			</div>
		</>
	)
}
export default CardDraw