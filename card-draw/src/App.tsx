//import { useState } from 'react';
import CardDraw from './CardDraw';
import Footer from './Footer';
// import About from './About';

const App = () => {
    //const [showAbout, setShowAbout] = useState<boolean>(false);
    return (
        <>
            <main className="main">
                <div className="content">
                    {/*showAbout ? <About /> : <CardDraw />*/}
                    <CardDraw />
                </div>
                {/*<Footer showAbout={showAbout} setShowAbout={setShowAbout} />*/}
                <Footer />
            </main>
        </>);
}

export default App;
