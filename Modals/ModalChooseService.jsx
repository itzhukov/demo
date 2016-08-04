import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import modalStyle from "./modalStyle";

export default class ModalChooseService extends React.Component {
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

	handleChoose() {
		this.close();
		this.props.callback();
	}

	render() {
		return (
			<div className="modalChooseService">
				<Modal
					isOpen={this.state.isOpen}
					onAfterOpen={this.afterOpen.bind(this)}
					shouldCloseOnOverlayClick={false}
					onRequestClose={this.close.bind(this)}
					style={modalStyle} >

					<div className="popup popup__chooseService" id="popup">
						<div className="popup__blue">
							<span className="icons icon-icons_logo2"></span>
						</div>
						<div className="continue">
							Уважаемый пользователь,	вы собираетесь выбрать автосервис "{this.props.serviceName}" по своей заявке №{this.props.bidId}.
							<br />
							<br />
							<button onClick={this.handleChoose.bind(this)} className="button button_blue eButton actionSelectService" data-user_id={this.props.serviceId} data-user_name={this.props.serviceName}>
								<span>Выбрать</span>
							</button>
							<button onClick={this.close.bind(this)} className="button button_blue eButton buttonClose">
								<span>Отмена</span>
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