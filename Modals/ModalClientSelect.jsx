import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import modalStyle from "./modalStyle";

export default class ModalClientSelect extends React.Component {
	constructor() {
		super()
		this.state = {
			isOpen: true,
			serviceName: '',
			bidId: null,
			serviceAddress: ''
		}
	}

	open(){
		this.setState({
			isOpen: true
		});
	}

	afterOpen() {
		
	}

	close() {
		this.setState({
			isOpen: false
		}, () => {
			this.props.removeModal( this.props.modalId);
		});

	}

	render() {
		return (
			<div className="modalClientSelect">
				<Modal
					isOpen={this.state.isOpen}
					onAfterOpen={this.afterOpen.bind(this)}
					shouldCloseOnOverlayClick={false}
					onRequestClose={this.close.bind(this)}
					style={modalStyle} >

					<div className="popup" id="popup">
						<div className="popup__blue">
							<span className="icons icon-icons_logo2"></span>
						</div>
						<div className="continue">
							Спасибо что выбрали "{this.props.serviceName}",
							Вас ожидают по адресу: <br />{this.props.serviceAddress}.<br />
							Вы можете распечатать <a href={'/bid/'+this.props.bidId+'/invitation'} target="_blank">направление на ремонт </a>
							<br />
							<br />
							<button onClick={this.close.bind(this)} className="button button_blue eButton buttonClose">
								<span>Продолжить</span>
							</button>
						</div>
						<div onClick={this.close.bind(this)} className="popup__close">
							<span className="icons icon-icons_close"></span>
						</div>
					</div>

				</Modal>
			</div>
		);
	}
}