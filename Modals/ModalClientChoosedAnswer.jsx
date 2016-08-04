import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import modalStyle from "./modalStyle";

export default class ModalClientChoosedAnswer extends React.Component {
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

		let bid_id = this.props.bidId;

		$('.profile .tab_head li[data-tab=profile_message]').attr('data-active_bid', bid_id).trigger('click');
		this.close();
	}

	handleChoose() {
		this.close();
		this.props.callback();
	}

	render() {
		return (
			<div className="modalClientChoosedAnswer">
				<Modal
					isOpen={this.state.isOpen}
					onAfterOpen={this.afterOpen.bind(this)}
					shouldCloseOnOverlayClick={false}
					onRequestClose={this.close.bind(this)}
					style={modalStyle} >

					<div className="popup popup__selectedService" id="popup">
						<div className="popup__blue popup__blue--title">
							<p className="popup__title">Информер по заявке</p>
						</div>
						<div className="continue">
							<div className="text">
								<p>Заказчик выбрал Ваш автосервис (заявка № <a onClick={this.actionGoToBid.bind(this)}  data-bid_id={this.props.bidId} href={'/profile?tab=profile_message&active_bid='+this.props.bidId}>{this.props.bidId}</a>) и получил <a target="_blank" href={'/bid/'+this.props.bidId+'/invitation'}>«Направление на ремонт»</a> - этот документ подтверждает Вашу договорённость о ценах и ремонтных работах. Уточните с заказчиком дату и время его визита и ожидайте его.</p>
							</div>
							<div className="continue--wrapper">
								<button  onClick={this.close.bind(this)}  data-confirmed="false" type="button" className="button button_transparent_blue buttonClose nofloat">
									<span className="textsearch">Ок</span>
								</button>
							</div>
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