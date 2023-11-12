/// <reference types="vite-plugin-svgr/client" />
import Close from '../assets/close.svg?react';

const DialogBox = (props: any) => {

    const confirmAndClose = () => {
        props.onConfirm();
        props.setDboxOpened();
    }

    return (<>
        <div className="dbox">
            <div className="dbox-upper">
                <p className="dbox-upper-text">Confirm action</p>
                <div className="dbox-upper-button">
                    <Close onClick={props.onCancel} className="dbox-upper-close"/>
                </div>
            </div>
            <div className="dbox-body">
                <p className="dbox-body-text">{props.message}</p>
                <div className="dbox-options">
					<button onClick={confirmAndClose} className="dbox-options-yes" >Confirm</button>
					<button onClick={props.onCancel} className="dbox-options-no">Cancel</button>
                </div>
            </div>
        </div>
	</>)
}

export default DialogBox;