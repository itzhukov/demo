import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import modalStyle from "./modalStyle";

export default class ModalClientNewbid extends React.Component {
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

	actionGoToBid(event) {
		event.preventDefault();

		this.close();
		this.props.callback();
	}

	handleChoose() {
		this.close();
		this.props.callback();
	}

	render() {
		let text = '';

		switch (+this.props.newbid_type) {
			case 1:
				text = '...и отправлена в автосервис. Ответы на заявку вы можете посмотреть в личном кабинете. Информация о поступлении новых ответов будет направляться на вашу электронную почту и телефон.';
				break;
			
			case 2:
				text = '...и отправлена в автосервис. Ответы на заявку вы можете посмотреть в личном кабинете. Информация о поступлении новых ответов будет направляться на вашу электронную почту и телефон.';
				break;

			case 3:
				text = '...и отправлена в автосервисы. Ответы на заявку вы можете посмотреть в личном кабинете. Информация о поступлении новых ответов будет направляться на вашу электронную почту и телефон.';
				break;

			default:
				break;
		}

		return (
			<div className="modalClientNewbid">
				<Modal
					isOpen={this.state.isOpen}
					onAfterOpen={this.afterOpen.bind(this)}
					shouldCloseOnOverlayClick={false}
					onRequestClose={this.close.bind(this)}
					style={modalStyle} >

					<div className="popup" id="popup">
						<div className="popup__blue popup__blue--title">
							<p className="popup__title">Информер по заявке</p>
						</div>
						<div className="continue">
							<div className="text">
								<h3 className="text--h3">
									Ваша заявка зарегистрирована
								</h3>
								<p className="text--p">{text}</p>

							</div>
							<button onClick={this.actionGoToBid.bind(this)} className="button button_transparent_blue newbid_cont">
								<span className="">Перейти к заявке</span>
							</button>
						</div>
						<div onClick={this.close.bind(this)}  className="popup__close">
							<span className="icons icon-icons_close"></span>
						</div>
					</div>

				</Modal>
			</div>
		);
	}
}