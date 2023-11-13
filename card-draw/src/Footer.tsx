import './index.css';
import './reset.css';

function Footer(props: any) {
	return (<>
		<footer className="footer">
		<p className="footer-text">built for <a className="link" href="https://rip.ddrillini.club/" target="_blank">RIP13.5</a> by sorae & CERiNG &nbsp;&nbsp;•&nbsp;&nbsp; <a className="link" href="https://github.com/soraeee/rip-card-draw" target="_blank">github</a> &nbsp;&nbsp;•&nbsp;&nbsp; trans rights &nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</p>
			{props.showAbout ?
				<p className="footer-text"><a className="link" onClick={() => props.setShowAbout(!props.showAbout)}>back to card draw</a></p>
				: <p className="footer-text"><a className="link" onClick={() => props.setShowAbout(!props.showAbout)}>about</a></p>}
		</footer>
	</>)
}

export default Footer;
