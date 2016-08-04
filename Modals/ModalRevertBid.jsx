import React from "react";
import ReactDOM from "react-dom";
import Modal from "react-modal";
import modalStyle from "./modalStyle";

export default class ModalRevertBid extends React.Component {
	constructor() {
		super()

		this.state = {
			isOpen: true
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
		});
		// ToDo: remove component from DOM
		// React.unmountComponentAtNode(document.getElementById('container'));
	}

	handlerRenewBid(event) {
		// console.log('-> handlerRenewBid');

		let data = this.props.dataBid;

		var form = $('<form/>', {
			id: 'go2newbid',
			method: 'POST',
			action:  '/bid/newbid'
		});

		form.append($('<input/>', {
			name: 'car',
			value: +data.car || null,
			type: 'hidden'
		}));
		
		form.append($('<input/>', {
			name: 'img',
			value: data.img || null,
			type: 'hidden'
		}));

		form.append($('<input/>', {
			name: 'type',
			value: 1,
			type: 'hidden'
		}));

		form.append($('<input/>', {
			name: 'notservice',
			value: +data.service_id || null,
			type: 'hidden'
		}));

		form.append($('<input/>', {
			name: 'evacuator',
			value: data.evacuator || null,
			type: 'hidden'
		}));

		form.append($('<input/>', {
			name: 'parts',
			value: data.parts || null,
			type: 'hidden'
		}));

		form.append($('<input/>', {
			name: 'current_time',
			value: +data.current_time || null,
			type: 'hidden'
		}));

		form.append($('<input/>', {
			name: 'description',
			value: data.description || null,
			type: 'hidden'
		}));

		$('body').append(form);

		form.submit();

		this.close();
	}

	render() {
		return (
			<div className="modalRevertBid">
				<Modal
					isOpen={this.state.isOpen}
					onAfterOpen={this.afterOpen.bind(this)}
					shouldCloseOnOverlayClick={false}
					onRequestClose={this.close.bind(this)}
					style={modalStyle} >

					<div className="popup popup__revertbid" id="popup">
						<div className="popup__blue popup__blue--title">
							<p className="popup__title">Информер по заявке</p>
						</div>
						<div className="continue">
							<div className="text">
								
								<h3 className="h3">Уважаемый пользователь!</h3>
								<p>Автосервис "{this.props.serviceName}" отклонил Вашу заявку №{this.props.bidId}.</p>
								<p>Однако, прямо сейчас Вы можете создать новую общую заявку во все автосервисы портала Uremont.</p>
							</div>
							<div className="continue--wrapper">
								<button  onClick={this.handlerRenewBid.bind(this)} data-confirmed="true" data-bid_id={this.props.bidId} className="button button_transparent_blue actionRevertBid">
									<span className="textsearch">Создать новую заявку</span>
								</button>
								<button onClick={this.close.bind(this)} data-confirmed="false" data-bid_id={this.props.bidId} type="button" className="button button_transparent_blue buttonClose">
									<span className="textsearch">Отмена</span>
								</button>
							</div>
						</div>
						<div className="popup__close" onClick={this.close.bind(this)}>
							<span className="icons icon-icons_close"></span>
						</div>
					</div>
				</Modal>
			</div>
		);
	}
}