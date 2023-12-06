import { useState } from 'react';
import CardDraw from './CardDraw';
import WarningModal from './components/WarningModal';

const App = () => {
    interface Warning {
        enabled: boolean,
        message: string,
        type: number
    }
    const [warning, setWarning] = useState<Warning>({enabled: false, message: "", type: 0})
    return (
        <>
            {warning.enabled && <WarningModal warning = {warning} setWarning = {setWarning}/>}
            <main className="main">
                <div className="content">
                    <CardDraw setWarning = {setWarning}/>
                </div>
            </main>
        </>);
}

export default App;
