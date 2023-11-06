import './index.css'
import './reset.css'

function CardModal(props: any) {

	return (
		<>
			<div>
				{/* Modal closes when clicking outside of the modal */}
				<div className="modal-backdrop" onClick={() => props.setModalOpened(-1)}></div>
				<div className="modal-wrapper">
					<div className="modal-section">
						<div className="modal-section-inner">
							<p className="modal-text-major text-p1">P1</p>
						</div>
						<div className="modal-section-inner">
							<div className="modal-button">
								<button onClick={() => props.setCardStatus([1, 1])}>Protect</button>
							</div>
							<div className="modal-button">
								<button onClick={() => props.setCardStatus([2, 1])}>Veto</button>
							</div>
						</div>
					</div>
					<div className="modal-section">
						<div className="modal-section-inner">
							<p className="modal-text-major text-p2">P2</p>
						</div>
						<div className="modal-section-inner">
							<div className="modal-button">
								<button onClick={() => props.setCardStatus([1, 2])}>Protect</button>
							</div>
							<div className="modal-button">
								<button onClick={() => props.setCardStatus([2, 2])}>Veto</button>
							</div>
						</div>
					</div>
					<div className="modal-section">
						<div className="modal-section-inner">
							<img className="icon-svg"
								style={{ "width": "35px", "filter": "invert(100%) sepia(11%) saturate(7499%) hue-rotate(182deg) brightness(110%) contrast(100%)" }}
								src="gear.svg"></img>
						</div>
						<div className="modal-section-inner">
							<div className="modal-button">
								<button onClick={() => props.setCardStatus([0, 0])}>Reset</button>
							</div>
							<div className="modal-button">
								<button>Redraw</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default CardModal