/// <reference types="vite-plugin-svgr/client" />
import { useState } from 'react';
import Caret from '../assets/caret.svg?react';

const NumberField = (props: any) => {

    const [value, setValue] = useState(props.initValue);

	// Clamps number to a range 
	const clamp = (n: number, min: number, max: number) => {
		return Math.min(Math.max(n, min), max);
	}

    // Performs a confirmation
    //const confirm = async () => {
    //    if (props.confirm) {
    //    }
    //    return res;
    //}

    const increment = () => {
        let n = value + 1;
        n = clamp(n, props.min, props.max);
        setValue(n);
        props.onChange(n);
    }

    const decrement = () => {
        let n = value - 1;
        n = clamp(n, props.min, props.max);
        setValue(n);
        props.onChange(n);
    }

    const otherChange = (e: any) => {
        let n = !isNaN(Number(e.currentTarget.value)) ? Number(e.currentTarget.value) : value;
        n = clamp(n, props.min, props.max);
        setValue(n);
        props.onChange(n);
    }

    return (<>
        <div className="numfield">
            <p className="numfield-title">{props.desc}</p>
            <div className="numfield-inner">
                <input className="numfield-value" type="text" value={value} onChange={otherChange}/>
                <div className="numfield-controls">
                    <button className="numfield-increment" onClick={increment}><Caret className="caret-increment"/></button>
                    <button className="numfield-decrement" onClick={decrement}><Caret className="caret-decrement"/></button>
                </div>
            </div>
        </div>
	</>)
}

export default NumberField;