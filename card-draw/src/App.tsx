import { useState } from 'react';
import CardDraw from './CardDraw';
import Footer from './Footer';
import About from './components/About';
import WarningModal from './components/WarningModal';

const App = () => {
    interface Warning {
        enabled: boolean,
        message: string,
        type: number
    }
    const [showAbout, setShowAbout] = useState<boolean>(false);
    const [warning, setWarning] = useState<Warning>({enabled: false, message: "", type: 0})
    return (
        <>
            {warning.enabled && <WarningModal warning = {warning} setWarning = {setWarning}/>}
            <main className="main">
                <div className="content">
                    {showAbout && <About setShowAbout = {setShowAbout} />}
                    <CardDraw setWarning = {setWarning}/>
                </div>
		        {showAbout && <div className="backdrop-dbox" onClick={() => setShowAbout(false)}></div>}
                <Footer showAbout={showAbout} setShowAbout={setShowAbout} />
            </main>
        </>);
}

export default App;
