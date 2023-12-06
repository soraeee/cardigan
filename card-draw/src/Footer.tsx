function Footer(props: any) {
	return (<>
		<footer className="footer">
		<p className="footer-text"><a className="link" onClick={() => props.setShowAbout(!props.showAbout)}>about</a> &nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; <a className="link" href="https://github.com/soraeee/cardigan" target="_blank">github</a> &nbsp;&nbsp;•&nbsp;&nbsp; trans rights</p>
		
		</footer>
	</>)
}

export default Footer;
