import rip135 from './assets/packs/rip135.json'
import eclipse2023 from './assets/packs/eclipse2023.json'
import rip14 from './assets/packs/rip14.json'

import { useState, useEffect } from 'react';
import Card from './components/Card';
import NumberField from './components/NumberField';
import DialogBox from './components/DialogBox';
import About from './components/About';
import Footer from './Footer';
import Ring1 from './assets/ring/ring1.svg?react';
import Ring2 from './assets/ring/ring2.svg?react';
import Ring3 from './assets/ring/ring3.svg?react';
import Ring4 from './assets/ring/ring4.svg?react';
import Logo from './assets/logo.svg?react';
import List from './assets/list.svg?react';

const CardDraw = (props: any) => {

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

	let chartarr: Chart[] = [];

	// Pack selector
	// I want to make this dynamic and scalable but it is 2AM and i cannot figure this out
	const [currentPack, setCurrentPack] = useState<number>(2);
	const packs = [rip135, eclipse2023, rip14]

	const defaultNumToDraw = 7;
	const packTiers = packs[currentPack].charts.map(chart => Number(chart.title.match(/\[T(\d{1,2})\]\s?/)![1]));
	const [defaultMin, defaultMax] = [Math.min(...packTiers), Math.max(...packTiers)];

	// Current card draw state
	const [numToDraw, setNumToDraw] = useState<number>(defaultNumToDraw);
	const [spread, setSpread] = useState<Chart[]>([]);
	const [range, setRange] = useState<number[]>([defaultMin, defaultMax]);
	const [eligibleCharts, setEligibleCharts] = useState<Chart[][]>([[], []]); // [0] -> can be drawn, [1] -> removed from pool in no replacement draws
	const [protectOrder, setProtectOrder] = useState<number>(0);

	// Modal will open when chart's ID matches this state
	const [modalOpened, setModalOpened] = useState<number>(-1);

	// only way i can think of trying to tell Card that a new draw happened without lifting cardState up. help
	const [updateCard, setupdateCard] = useState<number>(0);

	// Checkbox stuff
	const [noRP, setNoRP] = useState<boolean>(true);
	const [debug, setDebug] = useState<boolean>(false);
	const [autoclear, setAutoclear] = useState<boolean>(false);
	const [noFields, setNoFields] = useState<boolean>(false);
	const [noConfirms, setNoConfirms] = useState<boolean>(false);
	const [showBackground, setShowBackground] = useState<boolean>(true);
	const [mobileMenu, setMobileMenu] = useState<boolean>(true);

	// Moved from app.tsx lol
    const [showAbout, setShowAbout] = useState<boolean>(false);

	// init
	useEffect(() => {
		populateCharts(currentPack);
		setEligibleCharts([chartarr, []]);
		// Animated background automatically starts off width <= 600px
		if (window.innerWidth <= 600) {
			setShowBackground(false);
		}
	}, []);
	// Gets transliterated string, if available
	const translit = (chart: {[index: string]:any}, prop: string) => {
		return (chart[`${prop}translit`] != "") ? chart[`${prop}translit`] : chart[`${prop}`];
	}

	// Rounds number and converts to a string
	const strround = (n: number) => String(Math.round(n));

	const populateCharts = (p: number) => {
		chartarr = [];
		// Process chart metadata to something that we actually need
		packs[p].charts.forEach(chart => {
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
		});
	}

	populateCharts(currentPack);

	const switchPack = (a: string) => {
		const pack = (a as unknown) as number // thanks typescript
		setCurrentPack(pack)
		populateCharts(pack);
		setSpread([]);
		setModalOpened(-1);
		setProtectOrder(0);

		// Change eligible charts to be within range
		const chartsInRange: Chart[] = chartarr.filter(chart => {
			if (chart["tier"] >= range[0] && chart["tier"] <= range[1]) return chart
		})

		const changedTiers = packs[pack].charts.map(chart => Number(chart.title.match(/\[T(\d{1,2})\]\s?/)![1]));
		changeDrawRange(Math.min(...changedTiers), Math.max(...changedTiers));
		setEligibleCharts([chartsInRange, []]);
	}

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

	// Calculate win-loss stats
	const [winsP1, setWinsP1] = useState<number>(0);
	const [winsP2, setWinsP2] = useState<number>(0);
	const winsTotal	= winsP1 + winsP2;
	const lossesP1	= winsTotal - winsP1;
	const lossesP2	= winsTotal - winsP2;

	// Get, clear values of input fields
	const [matchName, setMatchName] = useState<string>('');
	const [p1Name, setP1Name] = useState<string>('');
	const [p2Name, setP2Name] = useState<string>('');
	const inputSetFuncs = [setMatchName, setP1Name, setP2Name];
	const changeMatchName = (e: any) => setMatchName(e.target.value);
	const changeP1Name = (e: any) => setP1Name(e.target.value);
	const changeP2Name = (e: any) => setP2Name(e.target.value);
	const clearFields = () => inputSetFuncs.forEach(func => func(''));

	// Draw n number of charts from the available pool
	const draw = () => {
		let chartPool: Chart[] = eligibleCharts[0]
		let spentCharts: Chart[] = [...eligibleCharts[1]];

		// Don't explode when there aren't enough charts to draw
		if (chartPool.length + spentCharts.length < numToDraw) {
			console.log("Not enough charts to draw!")
			props.setWarning({enabled: true, message: "Not enough charts to draw!", type: 1})
			return
		}

		// Fisher-Yates shuffle
		for (let i = chartPool.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartPool);
		}

		const drawnCharts: Chart[] = [];
		// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
		// caveat with this algo - when this is the case, the remaining charts will always show up first in the draw. idk if that's a huge issue, lol
		if (chartPool.length < numToDraw) {
			props.setWarning({enabled: true, message: "Chart pool refilled!", type: 0})
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
		setWinsP1(0);
		setWinsP2(0);
		if (spread.length !== 0 && autoclear) {
			clearFields();
		} 
	}

	// This is stupid, i don't know what i'm doing
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
		
		// Fisher-Yates shuffle
		for (let i = chartPool.length - 1; i >= 0; i--) {
			swapIndices(i, getRandomInt(i), chartPool);
		}

		// Get the next chart in line
		if (noRP) { // Redraw with no replacement enabled
			// Check if there are less charts left in the pool than the number to draw, and add charts back to the pool if true
			if (chartPool.length === 0) {
				props.setWarning({enabled: true, message: "Chart pool refilled!", type: 0})
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

	// Handle mobile interface
	const toggleMobileMenu = () => {
		setMobileMenu(!mobileMenu);
		if (mobileMenu)  {
			document.getElementById('settings')!.classList.add('settings-showmobile');
		} else {
			document.getElementById('settings')!.classList.remove('settings-showmobile');
		}
		document.getElementById('mobile-detail')!.style.display = mobileMenu ? 'none' : 'flex';
	}

	// Handle noFields
	const toggleNoFields = () => {
		setNoFields(!noFields);
		if (!noFields) {
			document.getElementById('nodraw')!.classList.add('nodraw-nofields');
			document.getElementById('nodraw')!.classList.remove('nodraw');
		} else {
			document.getElementById('nodraw')!.classList.remove('nodraw-nofields');
			document.getElementById('nodraw')!.classList.add('nodraw');
		}
	}

	// Clear card draw
	// Just for aesthetics tbh
	const clear = () => {
		setSpread([]);
		setModalOpened(-1);
		setProtectOrder(0);
		setWinsP1(0);
		setWinsP2(0);
		clearFields();
	}

	// Reset card draw
	// Useful for no replacement draws
	const reset = () => {
		setEligibleCharts([[...eligibleCharts[0], ...eligibleCharts[1]], []]);
		clear();
	}

	// Reset removed pool and toggle no replacement setting
	const changeNoRP = (value: boolean) => {
		setNoRP(value)
		setEligibleCharts([[...eligibleCharts[0], ...eligibleCharts[1]], []])
	}
	
	// Handle all confirm-able changes here
	const [dboxOpened, setDboxOpened] = useState<boolean>(false);
	const [dboxMessage, setDboxMessage] = useState<string>("");
	const [dboxAction, setDboxAction] = useState<any>(() => null);
	// TODO: Make dialog boxes pop up for params,dupe protection, card-redraw change

	// Reset
	const handleReset = () => {
		if (eligibleCharts[1].length !== 0) {
			setDboxMessage("Resetting everything will reset the available charts to select from the pool. Continue?");
			setDboxAction(() => reset);
			setDboxOpened(true);	
		} else {
			reset();
		}
	}
	// Clear
	const handleClear = () => {
		if (spread.length !== 0 && !noConfirms) {
			setDboxMessage("Continue with set clear? This will not affect available charts.");
			setDboxAction(() => clear);
			setDboxOpened(true);	
		} else {
			clear();
		}		
	}
	// Draw
	const handleDraw = () => {
		if (spread.length !== 0 && !noConfirms) {
			setDboxMessage("Continue with new card draw?");
			setDboxAction(() => draw);
			setDboxOpened(true);	
		} else {
			draw();
		}		
	}
	
	return (<>
		{/* Modal closes when clicking outside of the modal */}
        {showAbout && <About setShowAbout = {setShowAbout} />}
		{modalOpened > -1 && <div className="backdrop" onClick={() => setModalOpened(-1)}></div>}

		{/* Probably redundant? */}
		{dboxOpened && <div className="backdrop-dbox" onClick={() => setDboxOpened(false)}></div>}
		{showAbout && <div className="backdrop-dbox" onClick={() => setShowAbout(false)}></div>}

		<div className="header">
			<div className="header-controls">
				<div className="settings" id="settings">
					<div className="settings-fields">
						<div className="settings-inner">
							<NumberField desc="# to draw" initValue={defaultNumToDraw} min={1} max={Infinity} onChange={(n: number) => { setNumToDraw(n) }}/>
							<NumberField desc="Tier min." initValue={range[0]} min={defaultMin} max={range[1]} onChange={(n: number) => { changeDrawRange(n, range[1])}}/>
							<NumberField desc="Tier max." initValue={range[1]} min={range[0]} max={defaultMax} onChange={(n: number) => { changeDrawRange(range[0], n)}}/>
						</div>
						<p className="settings-warning"><b>NOTE:</b> Changing <b className="text-p2">tier ranges</b> and <b className="text-p2">dupe protection</b> <u>does not prompt a dialog box</u> and will <u>RESET</u> the available charts to select from the pool if dupe protection is on. Please be careful!!</p>
					</div>
					<div className="pack-select">
						<div>
							<p className="numfield-title">Pack to draw from</p>
						</div>
						<select name="packs" id="packs" onChange={(v) => switchPack(v.target.value)}>
							<option value="0">RIP 13.5</option>
							<option value="1" >Eclipse 2023</option>
							<option value="2" selected>RIP 14</option>
						</select>
					</div>
					<div className="settings-checks">
						<label className="checkbox">
							<input className="checkbox-input" type="checkbox"
							name="norp" id="norp" value="norp-enabled"
							onChange={(e) => { changeNoRP(e.target.checked) }} defaultChecked={noRP}/>
							<p className="checkbox-label">Dupe protection</p>
						</label>
						<label className="checkbox">
							<input className="checkbox-input" type="checkbox"
							name="debug" id="debug" value="debug-enabled"
							onChange={() => setDebug(!debug) } defaultChecked={debug}/>
							<p className="checkbox-label">Show remaining/discarded charts in the pool</p>
						</label>
						<label className="checkbox">
							<input className="checkbox-input" type="checkbox"
							name="autoclear" id="autoclear" value="autoclear-enabled"
							onChange={() => setAutoclear(!autoclear) } defaultChecked={autoclear}/>
							<p className="checkbox-label">Clear pool/players on new draw</p>
						</label>
						<label className="checkbox">
							<input className="checkbox-input" type="checkbox"
							name="nofields" id="nofields" value="nofields-enabled"
							onChange={() => toggleNoFields() } defaultChecked={noFields}/>
							<p className="checkbox-label">Disable pool/player fields</p>
						</label>
						<label className="checkbox">
							<input className="checkbox-input" type="checkbox"
							name="noconfirms" id="noconfirms" value="noconfirms-enabled"
							onChange={() => setNoConfirms(!noConfirms) } defaultChecked={noConfirms}/>
							<p className="checkbox-label">Disable non-reset confirmations</p>
						</label>
						<label className="checkbox" id="checkbox-showbackground">
							<input className="checkbox-input" type="checkbox"
							name="showbackground" id="showbackground" value="showbackground-enabled"
							onChange={() => setShowBackground(!showBackground) } defaultChecked={showBackground && window.innerWidth > 600}/>
							<p className="checkbox-label">Show animated background</p>
						</label>
					</div>
				</div>
				<div className="actions" id="actions">
					<button onClick={handleDraw} className="action-draw">Draw</button>
					<div className="actions-resets">
						<button onClick={handleClear} className="action-clear">Clear</button>
						<button onClick={handleReset} className="action-reset">Reset</button>
					</div>
				</div>
				<div className="mobile-detail" id="mobile-detail">
					<p>Drawing <b>{numToDraw}</b> songs from <u>{packs[currentPack].packName}</u>, tiers <b>{range[0]}</b>-<b>{range[1]}</b></p>
					<p>Dupe protection is <b>{noRP ? "on" : "off"}</b>.</p>
				</div>
			</div>
			<div className="header-info">
				<Logo className="logo"/>
				<List className="mobile-menu" onClick={() => toggleMobileMenu()}/>
				<Footer showAbout={showAbout} setShowAbout={setShowAbout} />
			</div>
		</div>
		<div className="display">
			
			{showBackground && <div className="ring-container">
				<div className="ring">
					<Ring1 className="ring-a"/>
					<Ring2 className="ring-b"/>
					<Ring3 className="ring-c"/>
					<Ring1 className="ring-d"/>
					<Ring3 className="ring-e"/>
					<Ring3 className="ring-f"/>
					<Ring3 className="ring-g"/>
					<Ring4 className="ring-h"/>
				</div>
			</div>}
			{!noFields && <div className="match">
				<div className="input">
					<input className="match-name" type="text" placeholder="Pool name" value={matchName} onChange={changeMatchName}/>
				</div>
				<div className="match-players">
					<div className="player-p1">
						<div className="player-id">
							<p className="player-id-text">P1</p>
						</div>
						<div className="player-info">
							<input className="player-name"type="text" placeholder="Player 1" value={p1Name} onChange={changeP1Name} />
							<p className="player-score">({winsP1}-{lossesP1})</p>
						</div>
					</div>
					<div className="player-p2">
						<div className="player-id">
							<p className="player-id-text">P2</p>
						</div>
						<div className="player-info">
							<input className="player-name"type="text" placeholder="Player 2" value={p2Name} onChange={changeP2Name} />
							<p className="player-score">({winsP2}-{lossesP2})</p>
						</div>
					</div>
				</div>
			</div>}
		{/* Show message when no card draw is present */}
			{spread.length === 0 && <div className="nodraw" id="nodraw">
				<div className="nodraw-text">
					<p className="nodraw-text-head">Waiting for next round to start...</p>
					<p className="nodraw-text-sub">Press "Draw" for a new set of charts</p>
				</div>
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
					// AAAAAA
					onChange		= {(n: number, pn: number) => {
						pn === 1 ? setWinsP1(winsP1 + n) : setWinsP2(winsP2 + n)
					}}
				/>)
			})}
			{debug && <>
				<div className="debug">
					<div className="debug-detail">
						<b className="text-p2">Charts remaining ({eligibleCharts[0].length})</b>
						<div className="debug-list">
						{eligibleCharts[0]
						.sort((a:Chart, b:Chart) => Number(a.title > b.title))
						.sort((a:Chart, b:Chart) => Number(a.tier > b.tier))
						.map(chart => {
							const tier = String(chart.tier).padStart(2,'0');
							const title = chart.title.length > 17 ? `${chart.title.slice(0,17).trim()}…` : chart.title;
							return <p>[{tier}] {title}</p>
						})}</div>
					</div>
					<div className="debug-detail">
						<b className="text-p1">Discarded charts ({eligibleCharts[1].length})</b>
						<div className="debug-list">
						{eligibleCharts[1]
						.sort((a:Chart, b:Chart) => Number(a.title > b.title))
						.sort((a:Chart, b:Chart) => Number(a.tier > b.tier))
						.map(chart => {
							const tier = String(chart.tier).padStart(2,'0');
							const title = chart.title.length > 17 ? `${chart.title.slice(0,17).trim()}…` : chart.title;
							return <p>[{tier}] {title}</p>
						})}</div>
					</div>
				</div>
			</>}
		</div>
		<div className = "fade"></div>
		{dboxOpened && <DialogBox
			setDboxOpened	= {setDboxOpened}
			message		= {dboxMessage}
			onConfirm	= {dboxAction}
			onCancel	= {() => setDboxOpened(false)}
		/>}
	</>)
}
export default CardDraw