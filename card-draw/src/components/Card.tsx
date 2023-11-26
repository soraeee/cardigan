
/// <reference types="vite-plugin-svgr/client" />
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import CardModal from './CardModal';
import Reset from '../assets/reset.svg?react';
import Protect from '../assets/protect.svg?react';
import Winner from '../assets/winner.svg?react';

const Card = (props: any) => {
	
	const [cardState, setCardState] = useState<number[]>([]);

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

	// Reset card state on a new draw
	useEffect(() => { setCardState([0, 0]) }, [props.numDraw]);

	// player text color
	// kind of redundant but i'm too lazy to figure out a more elegant solution
	const playerColor = cardState[1] === 1 ? "#FF5151" : "#54B4FF";
	const playerColorDark = cardState[1] === 1 ? "#a23a3a" : "#3674a3";

	let bannerBackground = {};
	if (props.chart.hasGfx) {
		let backgroundCss = `linear-gradient(90deg, #0a0a0af0 15%, #161616a7 100%), url("banner-images/${props.chart.gfxPath}")`;
		if (cardState[0] === 3) {
			backgroundCss = `linear-gradient(90deg, ${playerColorDark}df, 50%, #161616a7 100%), url("banner-images/${props.chart.gfxPath}")`;
		}
		bannerBackground = {
			"background": backgroundCss,
			"backgroundSize": "cover",
			"backgroundRepeat": "no-repeat",
			"backgroundPosition": "100% 50%"
		};
	}

	// difficulty stuff
	let diffClasses, cmodClass;
	if (cardState[0] === 2) {
		diffClasses = 'vcard-diff';
		cmodClass = 'vcard-text-nocmod';
	} else {
		diffClasses = 'card-diff';
		cmodClass = 'card-text-nocmod';
	}
	switch (props.chart.difficultyslot) {
		case 'Novice':		diffClasses += ' diff-novice'; 	break;
		case 'Easy':		diffClasses += ' diff-easy'; 	break;
		case 'Medium':		diffClasses += ' diff-medium'; 	break;
		case 'Hard':		diffClasses += ' diff-hard';	break;
		case 'Challenge':	diffClasses += ' diff-expert';	break;
		case 'Edit':		diffClasses += ' diff-edit'; 	break;
	} 

	// cmod?
	let noCmodTag;
	if (props.chart.nocmod) {
		noCmodTag = <div className={cmodClass}>No CMOD</div>
	}

	// open modal on click
	const toggleModal = () => {
		if (props.modalOpened === props.chart.id) {
			props.setModalOpened(-1);
		} else {
			props.setModalOpened(props.chart.id);
		}
	}

	// Grab wins
	const changeWins = (n: number, pn: number) => {
		if (pn === 1) {
			props.onChange(n, pn);
		} else {
			props.onChange(n, pn);
		}
	}

	const getSpread = () => {
		return props.spread.filter((chart: Chart) => chart["id"] != props.chart.id);
	}

	// Set if a card is protected/vetoed, and move it according to protect order
	const setCardStatus = (status: number[]) => {
		if (status[0] === 1 || status[0] === 3) {

			if (!(cardState[0] === 1 || cardState[0] === 3)) {
				// Remove the chart from the spread
				const newSpread: Chart[] = getSpread();
				newSpread.splice(props.protectOrder, 0, props.chart);
				props.setProtectOrder(props.protectOrder + 1);
				props.setSpread(newSpread);
			}
		} else {
			// Move the pointer to put protects in back one if we're changing a protected chart to veto/neutral
			if (cardState[0] === 1 || cardState[0] === 3) {
				const newSpread: Chart[] = getSpread();
				props.setProtectOrder(props.protectOrder - 1);
				newSpread.splice(props.protectOrder - 1, 0, props.chart);
				props.setSpread(newSpread);
			}
			if (status[0] === 2) {
				// Move vetoed charts to the end
				// Remove the chart from the spread
				const newSpread: Chart[] = getSpread();
				// Add the chart back into the spread at the end (we don't care about order lol)
				newSpread.push(props.chart);
				props.setSpread(newSpread);
			}
		}
		// Set the winState here so we can calculate win-loss
		// For new wins
		if (status[0] === 3) {
			changeWins(1, status[1]);
		}
		// Revert any win
		if (cardState[0] === 3) {
			changeWins(-1, cardState[1]);
		}
		props.setModalOpened(-1);
		setCardState(status);
	}

	// Handle long title text
	const refCard: any = useRef(null);
	const refTitle: any = useRef(null);
	const [cardWidth, setCardWidth] = useState(0);
	const [titleWidth, setTitleWidth] = useState(0);
	useLayoutEffect(() => {
		setCardWidth(refCard.current.clientWidth);
		setTitleWidth(refTitle.current.clientWidth);
	});
	useEffect(() => {
		const handleWindowResize = () => {
			setCardWidth(refCard.current.clientWidth);
			setTitleWidth(refTitle.current.clientWidth);
		}
		window.addEventListener('resize', handleWindowResize);
		return () => window.removeEventListener('resize', handleWindowResize);
	}, []);

	// Title masks
	let titleMask = {};
	const statusWidth = (cardState[0] === 1 || cardState[0] === 3) ? 68 : 0;
	const noCmodWidth = noCmodTag ? 38 : 0;
	const calcWidth = cardWidth - statusWidth - noCmodWidth - 150;
	if (titleWidth >= calcWidth) {
		titleMask = { 
			"maskImage": "linear-gradient(90deg, #f0f0f0 93%, transparent 100%)",
			"whiteSpace": "nowrap",
			"maxWidth": calcWidth,
			"overflow": "hidden",
		};
	}

	const defaultCard = (<>
		<div className={"card"} ref={refCard}>
			{cardState[0] > 0 && <div className={"card-status"} style={{"backgroundColor" : playerColor}}>
				{cardState[0] === 1 && <Protect className={"card-status-icon"}/>}
				{cardState[0] === 3 && <Winner className={"card-status-icon"}/>}
				<p className={"card-status-text"} style={{"color" : playerColorDark}}>P{cardState[1]}</p>
			</div>}
			<div key={props.chart.id} className={"card-inner"} style={bannerBackground} onClick={toggleModal}>
				<div className={"card-left"}>
					<div className={diffClasses}>
						<p className={"card-text-diff"}>{props.chart.difficulty}</p>
					</div>
					<div className={"card-meta"}>
						<p className={"card-text-artist"}>{props.chart.artist}</p>
						<div className={"card-title"}>
							<p className={"card-text-title"} ref={refTitle} style={titleMask}>{props.chart.title} {props.chart.winner}</p>
							{noCmodTag}
						</div>
						<p className={"card-text-subtitle"}>{props.chart.subtitle}</p>
					</div>
				</div>
				<div className={"card-right"}>
					<p className={"card-text-tier"}>Tier {props.chart.tier}</p>
					<p className={"card-text-bpm"}>{props.chart.bpmstring} BPM</p>
				</div>
				{props.modalOpened === props.chart.id && <CardModal
				modalOpened		= {props.modalOpened}
				setModalOpened	= {props.setModalOpened}
				cardState		= {cardState}
				setCardStatus	= {setCardStatus}
				redraw 			= {props.redraw}
				chartId 		= {props.chart.id} />}
			</div>
		</div>
	</>)

	const vetoedCard = (<>
		<div className="vcard" ref={refCard}>
			<div className="vcard-status" style={{"backgroundColor" : playerColorDark}}>
				<p className="vcard-status-text">Vetoed</p>
			</div>
			<div key={props.chart.id} className="vcard-inner">
				<div className="vcard-left">
					<div className={diffClasses}>
						<p className='vcard-text-diff'>{props.chart.difficulty}</p>
					</div>
					<div className="vcard-title"><p className="vcard-text-title" ref={refTitle}>{props.chart.title}</p>{noCmodTag}</div>
				</div>
			</div>
			<div className="modal-close" onClick={() => setCardStatus([0, 0])}>
				<Reset className="modal-close-icon"/>
				<p className="modal-tooltip">Reset</p>
			</div>
		</div>
	</>)

	return cardState[0] !== 2 ? defaultCard : vetoedCard;
}

export default Card;