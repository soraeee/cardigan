/// <reference types="vite-plugin-svgr/client" />
import Close from '../assets/close.svg?react';

function About(props: any) {
	return (<>
		<div className="about">

			<div className="about-button">
				<Close onClick={() => props.setShowAbout(false)} className="about-close" />
			</div>

			<p className="about-header">About</p>
			<p className="about-text">Cardigan is a webapp for running card draws using various ITG tournament packs.</p>
			<p className="about-text">Originally created for <a className="link" href="https://rip.ddrillini.club/" target="_blank">Rumble in the Prairie 13.5</a>, Cardigan now supports a variety of ITG tournaments and plans to support more upon request.</p>
			<br />

			<p className="about-header">Usage</p>
			<p className="about-text">Use the fields in the header to define the constraints for the card draw.</p>
			<p className="about-text">Press Draw to draw a set of charts. Press Reset to clear the card draw screen.</p>
			<p className="about-text">Dupe protection will prevent a chart from showing up in future draws once it has been drawn once, until all charts in the available pool have been drawn.</p>
			<p className="about-text">If dupe protection is on, pressing Reset will also restore all previously drawn charts into the pool to be drawn again.</p>
			<br />
			<p className="about-text">After drawing, click on a card to show options for that card.</p>
			<p className="about-text">Protect and Veto will display markers for that card to signify who has protected or vetoed that chart.</p>
			<p className="about-text">Clear will remove any protect or veto markers.</p>
			<p className="about-text">Redraw will draw a new chart from the available pool of charts and replace the current chart.</p>
			<br />

			<p className="about-header">FAQ</p>
			<p className="about-question">Why make a new website for card draws? Doesn't <a className="link" href="http://ddr.tools/" target="_blank">DDRTools</a> already exist?</p>
			<p className="about-text">When making this webapp for RIP13.5, we needed something that supported draws with dupe protection.</p>
			<p className="about-text">The reasonable solution here would have been to contact the maintainer of DDRTools and ask him to implement dupe protection, but it's more fun to build a new app from scratch instead of being reasonable.</p>
			<p className="about-text">(also sorae really needed practice with React)</p>
			<p className="about-text">Either way, please support DDRTools as well! We don't intend to compete with their project.</p>
			<br />

			<p className="about-question">Can I fork this project for my own tournament using my own pack?</p>
			<p className="about-text">Sure, feel free to fork!</p>
			<p className="about-text">If you use <a className="link" href="https://github.com/soraeee/sm2json" target="_blank">sm2json</a> and replace the banner images and the pack.json in this project, you should be able to get a working version with your own pack.</p>
			<p className="about-text">Ideally, this app will be maintained with the latest version of the RIP Singles Pack, or will have an option to select between different packs later.</p>
			<br />

			<p className="about-question">Where do I go to report bugs, suggest things for the project, or ask any general questions?</p>
			<p className="about-text">Follow the GitHub link in the footer, and open an issue (or a pull request if you've got some code)!</p>
			<p className="about-text">sorae and CERiNG can be contacted through Discord via the same handles.</p>
			<br />

			<p className="about-question">I hit the juckport 1 trillion$</p>
			<p className="about-text">good job</p>

			<br />
			
			<p className="about-header">Credits & Acknowledgements</p>
			<p className="about-question">Andrew "sorae" Vo</p>
			<p className="about-text">Website design and functionality</p>
			<p className="about-text">sm2json script</p>
			<br />
			<p className="about-question">Spencer "CERiNG" Gunning</p>
			<p className="about-text">Website design and functionality</p>
			<p className="about-text">sm2json script</p>
			<p className="about-text">Cardigan logo</p>
			<br />
			<p className="about-question">Tetaes</p>
			<p className="about-text">sm2json script</p>
			<br />
			<p className="about-question">Mirin</p>
			<p className="about-text">Requested the existence of this website</p>
			<br />
			<p className="about-question">Sam Oldenburg</p>
			<p className="about-text">Mobile un-scuffing</p>
			<br />
			<p className="about-question">You :)</p>
			<p className="about-text">your epic !</p>
		</div>
	</>)
}

export default About;