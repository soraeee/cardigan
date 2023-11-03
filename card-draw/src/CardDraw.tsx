import chartJSON from './assets/rip135-assets/pack.json'
import { useState } from 'react';
import './index.css'
import './reset.css'

function CardDraw() {

	interface Chart {
		id: number;
		title: string;
		subtitle: string;
		artist: string;
		difficulty: number;
		difficultyslot: string;
		displaybpm: string; // fuck off
		tier: number;
		hasBanner: boolean;
	}

	const chartarr: Chart[] = [];
	const numToDraw = 7;

	// Current card draw state
	const [spread, setSpread] = useState<number[]>([])

	// Process chart metadata to something that we actually need
	chartJSON.charts.forEach(chart => {
		{
			// Convert "[Txx] name" format into a Tier value
			let tier: number = Number(chart.title.substring(2, 4))
			// Use transliterated titles if available
			let songtitle: string = (chart.titletranslit != "") ? chart.titletranslit.substring(6, chart.titletranslit.length) : chart.title.substring(6, chart.title.length)
			let songartist: string = (chart.artisttranslit != "") ? chart.artisttranslit : chart.artist
			let songsubtitle: string = (chart.subtitletranslit != "") ? chart.subtitletranslit : chart.subtitle

			let displaybpmFormatted = ""
			if (chart.displaybpm[0] === chart.displaybpm[1]) {
				displaybpmFormatted = chart.displaybpm[0]
			} else {
				displaybpmFormatted = chart.displaybpm[0] + " - " + chart.displaybpm[1]
			}

			let hasBanner = false
			if (chart.bnpath != "") hasBanner = true

			// Add properly formatted metadata to array
			chartarr.push({
				id: Number(chart.sid),
				title: songtitle,
				artist: songartist,
				subtitle: songsubtitle,
				difficulty: Number(chart.difficulties[0].difficulty),
				difficultyslot: chart.difficulties[0].slot,
				displaybpm: displaybpmFormatted,
				tier: tier,
				hasBanner: hasBanner,
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

	// Draw n number of charts from the available pool
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

	function truncate(str: string){
		let n = 40
		if (str.length >= n) {
			return str.substring(0, n) + "...";
		}
		return str
	}


	// todo: split cards into its own component
	// todo: make displaybpm display not cursed
	return (
		<>
			<div className="header">
				<button onClick={draw} className="button">Draw</button>
			</div>
			<div className="cardDisplay">
				{chartarr.filter((chart) => {
					if (spread.includes(chart["id"])) return chart
				}).map((chart) => {
					// Stolen from DDRTools sorry man lol
					let bannerBackground = {};
					if (chart.hasBanner) {
						bannerBackground = {
							"background": `linear-gradient(45deg, #161616FF, #9EABFF88), url("src/assets/rip135-assets/bn-${chart.id}.png")`,
							"background-size": "100%",
							"background-position": "center",
						};
					}
					return <div key={chart.id} className="card" style={bannerBackground}>

						<div className="card-text-upper">
							<p className="card-text-artist">{chart.artist}</p>
							<p className="card-text-title">{truncate(chart.title)}</p>
							<p className="card-text-subtitle">{chart.subtitle}</p>
						</div>
						<div className="card-text-lower">
							<p className="card-text-tier">Tier {chart.tier}</p>
							<p className="card-text-diff">{chart.difficultyslot} {chart.difficulty}</p>
							<p className="card-text-bpm">{chart.displaybpm} BPM</p>
						</div>
					</div>
				})}
			</div>
		</>
	)
}
export default CardDraw