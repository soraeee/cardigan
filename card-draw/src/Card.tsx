import { useState } from 'react';
import './index.css'
import './reset.css'
import CardModal from './CardModal';

function Card(props: any) {
	//const [cardState, setCardState] = useState<number[]>([])

	// Stolen from DDRTools sorry man lol
	let bannerBackground = {};
	if (props.chart.hasGfx) {
		bannerBackground = {
			"background": `linear-gradient(90deg, #0a0a0af0 15%, #161616a7 100%), url("rip135-assets/${props.chart.gfxPath}")`,
			"background-size": "cover",
			"background-repeat": "no-repeat",
			"background-position": "100% 50%"
		};
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
		if (props.modalOpened === props.key) {
			props.setModalOpened(-1)
		} else {
			props.setModalOpened(props.chart.id)
		}
		console.log(props.modalOpened)
	}

	return <>
		<div key={props.chart.id} className="card" style={bannerBackground} onClick={toggleModal}>
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
			<div className="card-right">
				<p className="card-text-tier">Tier {props.chart.tier}</p>
				<p className="card-text-bpm">{props.chart.bpmstring} BPM</p>
			</div>
		</div>
		{props.modalOpened === props.chart.id && <CardModal modalOpened={props.modalOpened} setModalOpened={props.setModalOpened} />}
	</>
}

export default Card