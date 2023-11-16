/// <reference types="vite-plugin-svgr/client" />
import Info from '../assets/info.svg?react';
import Close from '../assets/close.svg?react';

function WarningModal(props: any) {
	let infoClass: string = props.warning.type === 0 ? "warningmodal-info-0" : "warningmodal-info-1"
	infoClass += " warningmodal-icon"

	return (<>
		<div className="warningmodal">
			<div>
				<Info className={infoClass} />
			</div>
			<p className = "warningmodal-text">{props.warning.message}</p>
			<div>
				<Close onClick={() => props.setWarning({enabled: false, message: "", type: 0})} className = "warningmodal-close warningmodal-icon"/>
			</div>
		</div>
	</>)
}

export default WarningModal;