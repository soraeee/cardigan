import { useState, useEffect } from 'react';
import './index.css'
import './reset.css'
import CardModal from './CardModal';

function Card(props: any) {
	const [cardState, setCardState] = useState<number[]>([])

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

	// Reset card state on a new draw
	useEffect(() => {
		setCardState([0, 0])
	}, [props.numDraw])

	// Stolen from DDRTools sorry man lol
	let bannerBackground = {};
	let cardBorder = {}
	if (props.chart.hasGfx) {
		let gradColor1: string = ""
		let gradColor2: string = ""
		let borderColor: string = "#808080FF"
		switch (cardState[0]) {
			case 0: // Neutral
				gradColor1 = "#0a0a0af0 15%"
				gradColor2 = "#16161655 100%"
				borderColor = "#808080FF"
				break;
			case 1: // Protect
				switch (cardState[1]) {
					case 1:
						gradColor1 = "#54B4FF44 15%"
						borderColor = "#54B4FFFF"
						break;
					case 2:
						gradColor1 = "#FF515144 15%"
						borderColor = "#FF5151FF"
						break;
				}
				gradColor2 = "#161616a7 100%"
				break;
			case 2: // Veto
				gradColor1 = "#0a0a0af0 50%"
				gradColor2 = "#0a0a0af0 50%"
				borderColor = "#242424FF"
				break;
		}
		bannerBackground = {
			"background": `linear-gradient(90deg, ${gradColor1}, ${gradColor2}), url("rip135-assets/${props.chart.gfxPath}")`,
		};

		{/*
			These properties were breaking the image when any of the veto/protext buttons were clicked lol
			"background-size": "cover",
			"background-repeat": "no-repeat",
			"background-position": "100% 50%" */}

		cardBorder = {
			"border-color": borderColor
		}
	}
	// player text color
	// kind of redundant but i'm too lazy to figure out a more elegant solution
	let playerColor = {}
	switch (cardState[1]) {
		case 1:
			playerColor = { "color": "#54B4FF" }; break;
		case 2:
			playerColor = { "color": "#FF5151" }; break;
	}

	// difficulty stuff
	let diffClasses = 'card-diff';
	switch (props.chart.difficultyslot) {
		case 'Novice': diffClasses += ' diff-n'; break;
		case 'Easy': diffClasses += ' diff-e'; break;
		case 'Medium': diffClasses += ' diff-m'; break;
		case 'Hard': diffClasses += ' diff-h'; break;
		case 'Challenge': diffClasses += ' diff-x'; break;
	}
	// cmod?
	let noCmodTag;
	if (props.chart.nocmod) {
		noCmodTag = <div className="card-text-nocmod">No CMOD</div>
	}

	// open modal on click
	function toggleModal() {
		if (props.modalOpened === props.chart.id) {
			props.setModalOpened(-1)
		} else {
			props.setModalOpened(props.chart.id)
		}
	}

	// Set if a card is protected/vetoed, and move it according to protect order
	function setCardStatus(status: number[]) {
		if (status[0] == 1) {
			// Moving protected charts to the start
			// Remove the chart from the spread
			let newSpread: Chart[] = props.spread.filter((chart: Chart) => {
				return chart["id"] != props.chart.id
			})
			// Add the chart back into the spread at the start, with later protects appearing after earlier ones
			if (cardState[0] == 1) {
				// Don't move it forward one spot if we're changing protect to protect
				newSpread.splice(props.protectOrder - 1, 0, props.chart)
			} else {
				newSpread.splice(props.protectOrder, 0, props.chart)
				props.setProtectOrder(props.protectOrder + 1)
			}
			props.setSpread(newSpread)
		} else {
			// Move the pointer to put protects in back one if we're changing a protected chart to veto/neutral
			if (cardState[0] == 1) {
				props.setProtectOrder(props.protectOrder - 1)
			}
			if (status[0] == 2) {
				// Move vetoed charts to the end
				// Remove the chart from the spread
				let newSpread: Chart[] = props.spread.filter((chart: Chart) => {
					return chart["id"] != props.chart.id
				})
				// Add the chart back into the spread at the end (we don't care about order lol)
				newSpread.push(props.chart)
				props.setSpread(newSpread)
			}
		}
		props.setModalOpened(-1)
		setCardState(status)
	}

	return <>
		<div key={props.chart.id} className="card" style={{ ...bannerBackground, ...cardBorder }} onClick={toggleModal}>
			<div className="card-left">
				<div className={diffClasses}>
					<p className='card-text-diff'>{props.chart.difficulty}</p>
				</div>
				<div className="card-meta">
					<p className="card-text-artist">{props.chart.artist}</p>
					<p className="card-text-title">{props.chart.title}{noCmodTag}</p>
					<p className="card-text-subtitle">{props.chart.subtitle}</p>
				</div>
			</div>


			<div className="card-right-wrapper">
				{cardState[0] > 0 && <div className="card-status-tooltip">
					<p className="card-status-playertext" style={playerColor}>P{cardState[1]}</p>
					{cardState[0] === 1 && <img className="icon-svg"
						style={{ "width": "35px", "filter": "invert(100%) sepia(11%) saturate(7499%) hue-rotate(182deg) brightness(110%) contrast(100%)" }}
						src="protect.svg">
					</img>}
					{cardState[0] === 2 && <img className="icon-svg"
						style={{ "width": "35px", "filter": "invert(100%) sepia(11%) saturate(7499%) hue-rotate(182deg) brightness(110%) contrast(100%)" }}
						src="veto.svg">
					</img>}
				</div>}
				<div className="card-right">
					<p className="card-text-tier">Tier {props.chart.tier}</p>
					<p className="card-text-bpm">{props.chart.bpmstring} BPM</p>
				</div>
			</div>
		</div>
		{props.modalOpened === props.chart.id && <CardModal
			modalOpened={props.modalOpened}
			setModalOpened={props.setModalOpened}
			setCardStatus={setCardStatus}
			redraw = {props.redraw}
			chartId = {props.chart.id} />}
	</>
}

export default Card