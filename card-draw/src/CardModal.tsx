import './index.css'
import './reset.css'

const CardModal = (props: any) => {
	return (<>
		<div>
			{/* Modal closes when clicking outside of the modal */}
			<div className="modal-backdrop" onClick={() => props.setModalOpened(-1)}></div>
			<div className="modal-wrapper">
				<div className="modal-section">
					<div className="modal-section-inner">
						<p className="modal-text-major">P1</p>
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
						<p className="modal-text-major">P2</p>
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
	</>)
}

export default CardModal