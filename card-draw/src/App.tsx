import { useState } from 'react';
import CardDraw from './CardDraw';
import Footer from './Footer';
import About from './About';

const App = () => {
	const [showAbout, setShowAbout] = useState<boolean>(false);
    (
        <>
            <main className="main">
                <div className="content">
                    {showAbout ? <About /> : <CardDraw />}
                </div>
                <Footer showAbout={showAbout} setShowAbout={setShowAbout} />
            </main>
        </>);
}

export default App;
