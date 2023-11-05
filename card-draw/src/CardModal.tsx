import './index.css'
import './reset.css'

function CardModal(props: any) {

	return (
		<>
			<div>
				{/* Modal closes when clicking outside of the modal */}
				<div className="modal-backdrop" onClick={() => props.setModalOpened(-1)}></div>
				<div className = "modal-items">
					<p>penis</p>
					<button>test</button>
				</div>
			</div>
		</>
	)
}

export default CardModal