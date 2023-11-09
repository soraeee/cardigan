import './index.css';
import './reset.css';
import { useState } from 'react';
import CardDraw from './CardDraw';
import Footer from './Footer';
import About from './About';

function App() {
	const [showAbout, setShowAbout] = useState<boolean>(false);

	return (
		<>
			{showAbout ? <About /> : <CardDraw />}
			<Footer showAbout = {showAbout} setShowAbout = {setShowAbout}/>
		</>
	)
}

export default App
