import { useState } from 'react';
import './index.css'
import './reset.css'
import CardModal from './CardModal';

function Card(props: any) {
	const [cardState, setCardState] = useState<number[]>([])

	// Stolen from DDRTools sorry man lol
	let bannerBackground = {};
	let cardBorder = {}
	if (props.chart.hasGfx) {
		let gradColor1: string = "#0a0a0af0 15%"
		let gradColor2: string = "#161616a7 100%"
		let borderColor: string = "#808080FF"
		switch (cardState[0]) {
			case 0: // Neutral
				gradColor1 = "#0a0a0af0 15%"
				gradColor2 = "#161616a7 100%"
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
				switch (cardState[1]) {
					case 1:
						gradColor2 = "#54B4FF33 100%"
						break;
					case 2:
						gradColor2 = "#FF515133 100%"
						break;
				}
				gradColor1 = "#161616F0 15%"
				borderColor = "#404040FF"
				break;
		}
		bannerBackground = {
			"background": `linear-gradient(90deg, ${gradColor1}, ${gradColor2}), url("rip135-assets/${props.chart.gfxPath}")`,
			"background-size": "cover",
			"background-repeat": "no-repeat",
			"background-position": "100% 50%"
		};

		cardBorder = {
			"border-color": borderColor
		}
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
	return <>
		<div key={props.chart.id} className="card" style={{ ...bannerBackground, ...cardBorder }} onClick={toggleModal}>
			<div className="card-left">
				<div className={diffClasses}>
					<p className='card-text-diff'>{props.chart.difficulty}</p>
				</div>
				<div className="card-meta">
					<p className="card-text-artist">{props.chart.artist}</p>
					<div className="card-title"><p className="card-text-title">{props.chart.title}</p>{noCmodTag}</div>
					<p className="card-text-subtitle">{props.chart.subtitle}</p>
				</div>
			</div>
			<div className="card-right">
				<p className="card-text-tier">Tier {props.chart.tier}</p>
				<p className="card-text-bpm">{props.chart.bpmstring} BPM</p>
			</div>
		</div>
		{props.modalOpened === props.chart.id && <CardModal modalOpened={props.modalOpened} setModalOpened={props.setModalOpened} setCardStatus={setCardState} />}
	</>
}

export default Card