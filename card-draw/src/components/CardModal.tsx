/// <reference types="vite-plugin-svgr/client" />
import Gear from '../assets/gear.svg?react';
import Protect from '../assets/protect.svg?react';
import Redraw from '../assets/redraw.svg?react';
import Reset from '../assets/reset.svg?react';
import Veto from '../assets/veto.svg?react';
import Winner from '../assets/winner.svg?react';

const CardModal = (props: any) => {

	const checkState = (status: number, pn: number) => {
		return props.cardState[0] === status && props.cardState[1] === pn;
	}

	return (<>
		<div className="modal">
			<div className="modal-section">
				<p className="modal-text-major text-p1">P1</p>
				<div className="modal-section-inner">
					{!checkState(1, 1) && <div className="modal-button" onClick={() => props.setCardStatus([1, 1])}>
						<Protect/>
						<p className="modal-tooltip">Protect</p>
					</div>}
					{!checkState(2, 1) && <div className="modal-button" onClick={() => props.setCardStatus([2, 1])}>
						<Veto/>
						<p className="modal-tooltip">Veto</p>
					</div>}
					{!checkState(3, 1) && <div className="modal-button" onClick={() => props.setCardStatus([3, 1])}>
						<Winner/>
						<p className="modal-tooltip">Winner</p>
					</div>}
				</div>
			</div>
			<div className="modal-section">
				<p className="modal-text-major text-p2">P2</p>
				<div className="modal-section-inner">
					{!checkState(1, 2) && <div className="modal-button" onClick={() => props.setCardStatus([1, 2])}>
						<Protect/>
						<p className="modal-tooltip">Protect</p>
					</div>}
					{!checkState(2, 2) && <div className="modal-button" onClick={() => props.setCardStatus([2, 2])}>
						<Veto/>
						<p className="modal-tooltip">Veto</p>
					</div>}
					{!checkState(3, 2) && <div className="modal-button" onClick={() => props.setCardStatus([3, 2])}>
						<Winner/>
						<p className="modal-tooltip">Winner</p>
					</div>}
				</div>
			</div>
			<div className="modal-section">
				<Gear className="modal-settings"/>
				<div className="modal-section-inner">
					<div className="modal-button" onClick={() => {props.setCardStatus([0, 0]); props.redraw(props.chartId)}}>
						<Redraw/>
						<p className="modal-tooltip">Redraw</p>
					</div>
					{!checkState(0, 0) && <div className="modal-button" onClick={() => props.setCardStatus([0, 0])}>
						<Reset/>
						<p className="modal-tooltip">Reset</p>
					</div>}
				</div>
			</div>
		</div>
	</>)
}

export default CardModal;