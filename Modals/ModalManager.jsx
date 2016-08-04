import React from "react";
import ReactDOM from "react-dom";
import ModalRevertBid from "./ModalRevertBid";
import ModalClientSelect from "./ModalClientSelect";
import ModalChooseService from "./ModalChooseService";
import ModalClientChoosedAnswer from "./ModalClientChoosedAnswer";
import ModalClientNewbid from "./ModalClientNewbid";

export default class ModalManager extends React.Component {
	constructor() {
		super();

		this.state = {
			// Список модальных окон к показу
			modalsList: []
		}
	}

	removeModal(modalId){
		// console.trace('-> removeModal', modalId);

		let newModalsList = [];

		this.state.modalsList.map( (item) => {
			(item.modalId != modalId) ? newModalsList.push(item) : null;
			return;
		});

		this.setState({
			modalsList: newModalsList
		});
	}

	// Добавить в очередь показ модального окна
	appendModal(modalname, data){
		setTimeout( () => {
			// console.trace('-> appendModal', modalname, data);

			let newModal = {};
			let modalId = parseInt(Math.random()*100000000000000000);

			switch (modalname) {
				case 'ModalClientSelect':
					newModal = {
						modalType: ModalClientSelect,
						options: data,
						modalId: modalId
					}

					this.setState({
						modalsList: [...this.state.modalsList, newModal]
					});
					break;
					
				case 'ModalClientNewbid':
					newModal = {
						modalType: ModalClientNewbid,
						options: data,
						modalId: modalId
					}

					this.setState({
						modalsList: [...this.state.modalsList, newModal]
					});
					break;
					
				case 'ModalClientChoosedAnswer':
					newModal = {
						modalType: ModalClientChoosedAnswer,
						options: data,
						modalId: modalId
					}

					this.setState({
						modalsList: [...this.state.modalsList, newModal]
					});
					break;

				case 'ModalRevertBid':
					newModal = {
						modalType: ModalRevertBid,
						options: data,
						modalId: modalId
					}

					this.setState({
						modalsList: [...this.state.modalsList, newModal]
					});
					break;

				case 'ModalChooseService':
					newModal = {
						modalType: ModalChooseService,
						options: data,
						modalId: modalId
					}

					this.setState({
						modalsList: [...this.state.modalsList, newModal]
					});
					break;

				default:
					break;
			}
		}, 0);
	}

	render() {
		return (
			<div className="modalManager">
				{
					this.state.modalsList.map( (item, i) => {
						return React.createElement(item.modalType, {
							...item.options,
							removeModal: this.removeModal.bind(this),
							modalId: item.modalId,
							key: i
						});
					})
				}
			</div>
		);
	}
}