/*********************************************** Require  ****************************************************/

require('jquery');
require('seo');
require('cars');
require('templateUtils');
require('validator');
require('maskedinput');
require('user');
require('underscore');
require('uploader');
require('popup');
require('cookieUtils');
require('certificate');
require('toastr');

/*********************************************** Newbid class ************************************************/

class Newbid {
	constructor() {
		// Инфо о ползователе
		this.userInfo = {}

		// Данные заявки
		this.data = {
			car: {
				body: null,
				body_id: null,
				brand: null,
				brand_id: null,
				color: '',
				gnumber: null,
				mileage: 0,
				model: null,
				model_id: null,
				modify: null,
				modify_id: null,
				transmission: null,
				transmission_id: null,
				vnumber: null,
				year: null
			},
			description: '', // Что нужно сделать?
			evacuator: null, // Необходим эвакуатор
			work_money: null,
			notservice: null,
			fid: null,
			img: [], // Фото поломки
			parts: null, // Собственные запчасти
			service: null,
			service_pull: [],
			time: 0, // Желаемая дата ремонта
			type: 1
		}

		// Валидация этапов
		this.validator = {
			steps: {
				1: false,
				2: false,
				3: true,
				4: true,
				5: false
			},
			userData: {
				name: false,
				email: false,
				phone: false,
				sms: false
			}
		}

		this.dataLoad();
		this.checkState();
	}

	renderModelList(event){
		__Cars.requestModels( this.getData('car').brand_id ).then( (result) => {
			__TU.getTemplateAjax('/newdesign/tpl/carModels.handlebars', function(template) {
				let modelsArray = __Cars.getObjectElementByName(result, ['name', 'id']);
				let spanArray = __Cars.abcCounter(modelsArray);

				uiModelList.find('.list.list_model').html(template(spanArray));

				uiAddNewCar.slideUp(200);
				uiYearList.slideUp(200);
				uiModelList.slideDown(200);
			});
		});
	}

	renderYearList(event){
		// console.log('-> renderYearList');

		__Cars.requestYears( this.getData('car').model_id ).then( (result) => {
			let compiledYears = __Cars.calculateYears(result);

			__TU.getTemplateAjax('/newdesign/tpl/carYears.handlebars', function(template) {
				$('.list_year').html(template(compiledYears));

				uiAddNewCar.slideUp(200);
				uiModelList.slideUp(200);
				uiYearList.slideDown(200);
			});
		});
	}

	// Получить данные
	getData(option){
		if (option) {
			switch(typeof option){
				case 'string': return this.data[option];

				case 'object':
					let optionsObject = {};
					let optionLen = option.length;

					for (let x=0; x < optionLen; x++) optionsObject[ option[x] ] =  this.data[option[x]];

					return optionsObject;

				default: return this.data;
			}
		} else {
			return this.data;
		}
	}

	// Проверка авторизован ли пользователь
	updateUserInfo(callback){
		// console.info('Newbid updateUserInfo');
		
		__User.getUserInfo().then( (result) => {
			let success = result.success;

			if (success){
				this.userInfo = result;
				this.updateCarList();
				if (typeof callback == 'function'){
					callback();
				}
			} else {
				renderBrandList(); // Загрузить список брендов
			}
		});
	}

	// Обновляем список авто пользователя
	updateCarList(){
		let userInfo = this.userInfo;
		let cars = userInfo.car;
		let carsLength = cars.length;
		let carsList = $( document.createDocumentFragment() );

		if (carsLength){
			for (let car = carsLength; car > 0; car--){
				let oneCar = cars[car-1];
				carsList.append('<option value="'+oneCar.id+'" data-id="'+oneCar.id+'" data-brandid="'+oneCar.brand.id+'" data-brandname="'+oneCar.brand.name+'" data-modelid="'+oneCar.model.id+'" data-modelname="'+oneCar.model.name+'" data-year="'+oneCar.year+'">'+oneCar.brand.name+' '+oneCar.model.name+' '+oneCar.year+'</option>');
			}
			existCarsList.html('').append(carsList).show();
			uiAddNewСarButton.show();
			uiAddNewCar.hide();
			existCarsList.trigger('change');
			uiFoldedRows.hide();
		} else {
			existCarsList.html('').hide();
			uiAddNewСarButton.hide();
			uiAddNewCar.show();
			renderBrandList();
			uiFoldedRows.html('').show();
		}
	}

	// Удалить опцию из data
	clearData(options){
		this.data[options] = null;
	}

	changeValidate(options){
		// console.info('Newbid changeValidate');
		for (let opt in options){
			switch(typeof options[opt]){
				case 'number':
				case 'string': this.validator[opt] = options[opt]; break;
				case 'object': this.validator[opt] = { ...this.validator[opt], ...options[opt] }; break;
				default: console.error('Передан неизвестнный тип опций', options[opt] ); break;
			}
		}
		this.checkState();
	}

	// Записать данные
	setData(options){
		// console.info('Newbid setData');

		for (let opt in options){

			switch(typeof options[opt]){
				case 'number':
				case 'string': this.data[opt] = options[opt]; break;
				case 'object':
					if ( Array.isArray(options[opt]) ){
						this.data[opt] = options[opt];
					} else {
						this.data[opt] = { ...this.data[opt], ...options[opt] };
					}
					break;
				default: console.error('Передан неизвестнный тип опций', options[opt] ); break;
			}
		}
		this.checkState();
	}

	// Распечатать в консоль состояние
	stateData(){
		// console.info( 'Newbid stateData: ', this.data, this.validator );
	}

	showErorrs(){
		this.checkAuthStep();
		if (!this.validator.steps['5']) {
			let userData = this.validator.userData;
			if (!userData.name || !userData.email || !userData.phone){
				toastr["warning"]("Зарегистрируйтесь или авторизуйтесь");
			}
		}
		if (!this.validator.steps['2']) toastr["warning"]("Опишите работы которые необходимо сделать");
		if (!this.validator.steps['1']) toastr["warning"]("Укажите информацию об автомобиле");
	}

	checkAuthStep(){
		// console.info('Newbid checkAuthStep');

		let step5valid = this.validator.steps[5];
		let userData = this.validator.userData;
		// console.info('step5valid', step5valid);

		if(!step5valid){
			if (userData.name && userData.email && userData.phone){
				if (userData.sms){
					actionConfirmCode();
				} else {
					actionRegister();
				}
			}
		}
	}

	// Проверка состояния заявки
	checkState(){
		// console.info('Newbid checkState');

		let data = this.data;
		let car = data.car;
		let car_id = data.car_id;
		let description = data.description;
		let step5valid = this.validator.steps[5];

		// step 1
		if (car_id || (car.brand_id && car.model_id && car.year) ){
			this.validator.steps['1'] = true;
		} else {
			this.validator.steps['1'] = false;
		}

		// step 2
		if  (description !== undefined && description.length) {
			this.validator.steps['2'] = true;
		} else {
			this.validator.steps['2'] = false;
		}

		// step 5
		if(step5valid){
			uiSendFormButton.show();
		} else {
			uiSendFormButton.hide();
		}

		this.stateData();
		this.renderFoldedRows();
		this.renderStepErrors();
	}

	// Отрисовка свёрнутого авто
	renderFoldedRows(){
		// console.info('Newbid renderFoldedRows');
		let folded = $( document.createDocumentFragment() );
		let car = this.data.car;

		if (car.brand_id || car.model_id || car.year){
			uiFoldedRows.html('');

			if (car.brand_id) folded.append('<li class="foldedBrand" data-id="'+car.brand_id+'">'+car.brand+'</li>');
			if (car.model_id) folded.append('<li class="foldedModel" data-id="'+car.model_id+'">'+car.model+'</li>');
			if (car.year) folded.append('<li class="foldedYear" data-id="'+car.year+'">'+car.year+'</li>');

			uiFoldedRows.append(folded);
		}
	}

	// Подсвечивание ошибок
	renderStepErrors(){
		// console.info('Newbid renderStepErrors');

		let validator = this.validator.steps;

		for (let step in validator){
			if (validator[step]) {
				$('.step[data-step='+step+']').removeClass('error');
			} else {
				$('.step[data-step='+step+']').addClass('error');
			}
		}
		this.renderStepSuccess();
	}

	readyToSend(){
		let validator = this.validator.steps;
		let can = true;

		for (let step in validator){
			if (!validator[step]) can = false;
		}

		return can;
	}

	// Подсвечиваение корректно заполненных этапов
	renderStepSuccess(){
		// console.info('Newbid renderStepSuccess');

		let validator = this.validator.steps;
		let stepList = [1, 2, 5];
		let stepListLen = stepList.length;

		for (var i = 0; i < stepListLen; i++) {
			if (validator[i]) { 
				$('.step[data-step='+i+']').addClass('success');
			} else {
				$('.step[data-step='+i+']').removeClass('success');
			}
		}
	}

	// Загружаем данные из view
	dataLoad(){
		// console.info('Newbid dataLoad');

		let hidden_form = $('.hidden_form');
		let inputs = hidden_form.find('input');

		inputs.each( (idx, item) => {
			let type = $(item).attr('name');
			let val = $(item).val();

			switch(type){
				case 'data-service[]':
					let service_pull = this.getData('service_pull');

					if (!service_pull.length){
						service_pull = [];
					}

					service_pull.push(val);

					this.setData({
						service_pull: service_pull,
						service: val
					});
					break;
				case 'auth':
					if ( val && val == 1 || val == 3){
						formSms.hide();
						uiStep5.hide();

						this.changeValidate({
							steps: { 5: true }
						});

						detectCert();
					}
					break;

				case 'evacuator':
					if (+val != 0){
						this.setData({
							evacuator: Number(val)
						});
						evacuator.prop('checked', true);
					}
					break;

				case 'parts':
					if (+val != 0){
						this.setData({
							parts: Number(val)
						});
						ownParts.prop('checked', true);
					}
					break;

				case 'type':
					this.setData({ type: +val });
					break;

				case 'auto':
					this.setData({
						car: { brand_id: +val }
					});
					break;

				case 'auto_name':
					this.setData({
						car: { brand: val }
					});
					break;

				case 'img[]':
					//TODO: доделать добавление фото
					// console.log('img', val);

					// let imgArray = newbid.getData('img');

					// imgArray.push( val );

					// newbid.setData({
					// 	img: imgArray
					// });
					break;

				case 'current_time':
					if (+val != 0){
						$('#datepicker').datepicker('setDate', val);
						this.setData({
							time: val
						});
						this.changeValidate({
							steps: { 4: true }
						});
						$('.step[data-step=4]').addClass('success');
					}
					break;

				case 'car':
					this.setData({
						car: { car_id: +val }
					});
					break;

				case 'notservice':
					this.setData({
						notservice: { notservice: +val }
					});
					break;

				case 'model':
					this.setData({
						car: { model_id: +val }
					});
					break;

				case 'model_name':
					this.setData({
						car: { model: val }
					});
					break;

				case 'year':
					this.setData({
						car: { year: +val }
					});
					break;

				case 'description':
					this.setData({
						description: val
					});
					$('.step textarea[name=work]').val(val);
					break;

				case 'work':
					this.setData({ fid: val });
					break;

				case 'work_edit':
					break;
			}
		
		});

		let description = $('.step textarea[name=work]').val() || '';

		if (description && description.length) {
			this.setData({
				description: description
			});
		}

		let car = this.data.car;

		if (car.brand_id && car.model_id && car.year) { // Есть вся информация об авто
			this.sendCar();
			uiAddNewCar.hide();
		} else if (car.brand_id || car.model_id) { // Есть один или два параметра
			if (car.brand_id && car.model_id) { // Есть два параметра (бренд и марка)
				this.renderYearList();
			} else { // Только один (только бренд)
				this.renderModelList();
			}
		} else {
			this.updateUserInfo();
		}
	}

	// Отправляем авто на сервер
	sendCar(callback) {
		console.info('Newbid sendCar');
		let car = this.getData('car');

		if (car.year){

			let auto = [{
				mark: (car.brand_id) ? car.brand_id : 0,
				model: (car.model_id) ? car.model_id : 0,
				year: (car.year) ? car.year : 2000
			}];

			__Cars.addNewCar(auto).then( (result) => {
				let id = result.id || 0;
				let success = result.success || false;

				if (success){
					console.info('Newbid sendCar success!');

					toastr["success"]("Автомобиль добавлен");
					this.updateUserInfo( () => {
						if (typeof callback == 'function'){
							callback();
						}
					});
				}
			});
		}
	}

}

/*********************************************** Vars ********************************************************/

let formAuth = $('.newbid .step .auth'); // Форма авторизации
let formRecover = $('.newbid .step .recoverPassword'); // Форма восстановления пароля
let formReg = $('.newbid .step .registr'); // Форма регистрации
let formSms = $('.newbid .step .sms'); // Форма отправки смс-кода
let evacuator = $('.step input[name=evacuate]'); // Необходим эвакуатор
let ownParts = $('.step input[name=parts]'); // Собственные запчасти
let uiAddNewCar = $('.addnewcar');
let uiBodyList = $('.choose_body');
let uiBrandList = $('.overview.brands'); // Контейнер для списка  брендов
let uiEnterButton = $('.auth_send'); // Кнопка "Вход" в форме авторизации
let uiModelList = $('.choose_model'); // Контейнер для списка моделей авто
let uiMoreBrands = $('.newbid .more'); // Кнопка "Показать все марки"
let uiUserEmail = $('.step .registr input[name=email]'); // Email пользователя
let uiUserName = $('.step .registr input[name=username]'); // Имя пользователя
let uiUserPhone = $('.step .registr input[name=phone]'); // Email пользователя
let uiYearList = $('.choose_year');
let uiConfirmCodeButton = $('.sms_send:eq(0)'); // Кнопка "Подтвердить" в форме отправки смс-кода
let uiStep5 = $('.step[data-step=5]'); // auth/reg/sendSms step
let uiAddNewСarButton = $('.add_new_car_button'); // Кнопка "Добавить новый автомобиль"
let uiCancelAddNewСarButton = $('.cancel_add_new_car_button'); // Кнопка "Отмена" при добавлении нового авто
let existCarsList = $('select.exist_cars_select'); // Список авто пользователя (select)
let uiFoldedRows = $('.foldedRows');
let uiSendFormButton = $('.sendform');
let uiWork = $('.step textarea[name=work]'); // Описание работ
let uiWork2 = $('.step textarea[name=work2]');
let uiNewbidform = $('.newbidform');
let uiRegistrSend = $('.newbid .step .registr .registr_send');

/*********************************************** Init ********************************************************/

let newbid = new Newbid; // Новая заявка
initDatePicker(); // Календарь "Желаемая дата ремонта"
initFileUploader(); // Загрузчик изображений
window.newbid = newbid;

/*********************************************** Listeners ***************************************************/

uiNewbidform.on('submit', function(event){
	event.preventDefault();
});
uiSendFormButton.on('click', actionSendBid);
uiAddNewСarButton.on('click', actionAddNewCar);
uiCancelAddNewСarButton.on('click', actionCancelAddNewCar);
existCarsList.on('change', actionChangeExistCarList);
uiConfirmCodeButton.on('click', actionConfirmCode); // Отправить смс
formAuth.on('click', '.recover', openReocverForm); // Открыть форму восстановления пароля
formAuth.on('click', '.reglink', openRegForm); // Открыть форму регистрации
formRecover.on('click', '.recover_send', actionRecover); // Отправить данные на восстановление пароля
formRecover.on('click', '.reglink', openAuthForm); // Открыть форму авторизации
formReg.on('click', '.registr_send', actionRegister); // Кнопка регистрации
formReg.on('click', '.reglink', openAuthForm); // Открыть форму авторизации
formSms.on('click', '.resend', actionResendSMS); // Отправить смс ещё раз
uiUserPhone.mask('+0000000000000'); // Phone mask
uiMoreBrands.on('click', actionToggleMoreBrands); // Раскрыть список брендов
uiBrandList.on('click', '.list-item', actionSelectBrand); // Выбор бренда
uiModelList.on('click', '.li', actionSelectModel); // Выбор бренда
uiYearList.on('click', '.li', actionSelectYear); // Выбор года
uiEnterButton.on('click', actionLogin); // Авторизация
uiUserName.on('input change', _.debounce(actionUserNameChange, 150) );
uiUserEmail.on('input change', _.debounce(actionUserEmailChange, 150) );
uiUserPhone.on('input change', _.debounce(actionUserPhoneChange, 150) );
uiWork.on('input change', _.debounce(descriptionChange, 100) ); // Изменения в поле описание работ
uiWork2.on('input change', _.debounce(descriptionChange2, 100) ); // Изменения в поле описание работ 2
uiFoldedRows.on('click', 'li', actionSelectFolded);
evacuator.on('change', evacuatorChange);
ownParts.on('change', ownPartsChange);

// uiBodyList.on('click', '.li', actionSelectBody); // Выбор кузова
// uiAddNewCar.on('input', '.brand_filter', brand_filter); // Фильтрация брендов
// uiExistCarsSelect.on('change', actionSelectExistCar); // Выбор авто из списка
// uiAdditionalCarInfo.on('click', actionAdditionalCar); // Кнопка "Доп. характеристики авто"

/*********************************************** Send bid ****************************************************/

/**
 * [actionSendBid Отправка заявки]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionSendBid(event){
	console.info('-> actionSendBid');

	__Seo.reachGoal('newbid_create_bid_client'); // Metrica цель: Кнопка отправить заявку из заявки

	preventExistEvent(event);

	let canSend = newbid.readyToSend();
	console.info( canSend );

	if (canSend){
		uiSendFormButton.prop('disabled', 'disabled').addClass('disabled');
		ajaxSendBid().then( (result) => {
			uiSendFormButton.prop('disabled', '').removeClass('disabled');
			
			let success = result.success;

			if (success) {
				let bid_type = newbid.getData('type');
				
				setTimeout(function(){
					window.location.href = '/profile?tab=profile_client_bids&newbid=true&newbid_type='+bid_type;
				});
			}
		});
	} else {
		let errorBlock = $('.step.error:eq(0)');

		if (errorBlock.length){
			newbid.showErorrs();
			$('html, body').stop().animate({
				scrollTop: errorBlock.offset().top
			}, 500);
		}
	}
}

/*********************************************** Car manager *************************************************/

/**
 * [actionCancelAddNewCar Отмена добавления нового авто]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionCancelAddNewCar(){
	uiCancelAddNewСarButton.hide();
	newbid.updateUserInfo();
	uiModelList.slideUp(200);
	uiYearList.slideUp(200);
	uiAddNewCar.hide();
}

/**
 * [actionAddNewCar Добавление нового авто]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionAddNewCar(){
	// console.info('-> actionAddNewCar');

	existCarsList.hide();
	uiAddNewСarButton.hide();
	uiAddNewCar.show();
	uiFoldedRows.html('').show();
	uiCancelAddNewСarButton.show();

	newbid.setData({
		car: {
			brand: null,
			brand_id: null,
			model: null,
			model_id: null,
			year: null
		}
	});

	renderBrandList();
}

/**
 * [brand_filter Фильтр брендов]
 * @author Vadim Zhukov
 * @date   2016-05-16
 */
function brand_filter(event) {
	preventExistEvent(event);

	let text = $(this).val();
	let cars = $('.overview.brands.hiddenCars');
	let brands = cars.find('.list-item');
	let more = uiMoreBrands;

	if (text != '') {
		cars.addClass('hiddenCars--open');
		more.hide();
		brands.hide();

		brands.each(function(idx, item) {
			let name = $(item).data('name').toLowerCase();
			let regEXP = new RegExp(text.toLowerCase());
			let check = regEXP.test(name);

			if (check) $(item).show();
		});
	} else {
		more.show();
		brands.show();
		cars.removeClass('hiddenCars--open');
	}
}

/**
 * [actionChangeExistCarList При выборе авто из списка - подставляем его в заявку]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionChangeExistCarList(event){
	// console.info('-> actionChangeExistCarList');

	let selectedOption = $('.exist_cars_select').find('option:selected');

	if (selectedOption.length){
		let data = selectedOption.data();

		newbid.setData({
			car_id: data.id,
			car: {
				brand: data.brandname,
				brand_id: data.brandid,
				model: data.modelname,
				model_id: data.modelid,
				year: data.year
			}
		});
	}
}

function actionSelectFolded(event){
	// console.info('-> actionSelectFolded');

	let selectedClass = $(this).attr('class');

	switch (selectedClass){
		case 'foldedBrand':
			newbid.setData({
				car: {
					brand: null,
					brand_id: null,
					model: null,
					model_id: null,
					year: null
				}
			});
			renderBrandList();
			break;

		case 'foldedModel':
			newbid.setData({
				car: {
					model: null,
					model_id: null,
					year: null
				}
			});
			newbid.renderModelList();
			break;

		case 'foldedYear':
			newbid.setData({
				car: {
					year: null
				}
			});
			newbid.renderYearList();
			break;
	}
}

/**
 * [actionToggleMoreBrands Раскрыть список брендов]
 * @author Vadim Zhukov
 * @date   2016-06-27
 */
function actionToggleMoreBrands(event){
	// console.trace('-> actionToggleMoreBrands');

	preventExistEvent(event);

	let panel = uiBrandList;
	let more = $(this).find('span');

	panel.toggleClass('hiddenCars--open');

	if (panel.hasClass('hiddenCars--open')) {
		more.text('Скрыть все марки');
	} else {
		more.text('Показать все марки');
		$('html, body').stop().animate({
			scrollTop: uiAddNewCar.offset().top
		}, 500);
	}
}

/**
 * [actionSelectBrand  Пользователь выбрал бренд]
 * @author Vadim Zhukov
 * @date   2016-06-27
 */
function actionSelectBrand(event){
	// console.trace('-> actionSelectBrand');

	if ( newbid.getData('car').brand_id ) return;

	$('.allcontent').stop().animate({
		scrollTop: $('.choose_model').offset().top
	}, 500);

	let brand = $(this).find('.name').text();
	let brand_id = $(this).attr('data-id');

	newbid.setData({
		car: {
			brand: brand,
			brand_id: brand_id
		}
	});

	newbid.renderModelList();
}

/**
 * [actionSelectModel Пользователь выбрал модель]
 * @author Vadim Zhukov
 * @date   2016-06-27
 */
function actionSelectModel(event){
	// console.trace('-> actionSelectModel');
	
	if ( newbid.getData('car').model_id ) return;

	let model = $(this).find('.modelname').text();
	let model_id = $(this).attr('data-id');

	newbid.setData({
		car: {
			model: model,
			model_id: model_id
		}
	});

	newbid.renderYearList();
}

/**
 * [actionSelectYear Пользователь выбрал год]
 * @author Vadim Zhukov
 * @date   2016-06-27
 */
function actionSelectYear(event){
	// console.trace('-> actionSelectYear');
	
	if ( newbid.getData('car').year ) return;

	let year = $(this).attr('data-year');

	newbid.setData({
		car: {
			year: year
		}
	});

	uiYearList.slideUp(200);
	uiCancelAddNewСarButton.hide();

	newbid.sendCar();
}

function actionSelectBody(event){
	// console.trace('-> actionSelectBody');
	
	if ( newbid.getData('car').body ) return;

	let body = $(this).text();
	let body_id = $(this).attr('data-id');

	newbid.setData({
		car: {
			body: body,
			body_id: body_id
		}
	});
}

/*********************************************** Car render **************************************************/

function renderBrandList(event){
	__Cars.requestBrands().then( (result) => {
		__TU.getTemplateAjax('/newdesign/tpl/brands.handlebars', function(template) {
			uiBrandList.html(template(result));

			uiModelList.slideUp(200);
			uiYearList.slideUp(200);
			uiAddNewCar.slideDown(200);
		});
	});
}

function renderBodyList(event){
	__Cars.requestBodies( newbid.getData('car').model_id, newbid.getData('car').year ).then( (result) => {
		__TU.getTemplateAjax('/newdesign/tpl/carBody.handlebars', function(template) {
			$('.list_body').html(template(result));

			uiAddNewCar.slideUp(200);
			uiYearList.slideUp(200);
			uiBodyList.slideDown(200);
		});
	});
}

/*********************************************** Checkboxes **************************************************/

/**
 * [evacuatorChange Необходим эвакуатор]
 * @author Vadim Zhukov
 * @date   2016-06-27
 */
function evacuatorChange(event){
	// console.trace('-> evacuatorChange');

	let checked = $(this).prop('checked');

	newbid.setData({
		evacuator: Number(checked)
	});
}

/**
 * [ownPartsChange Собственные запчасти]
 * @author Vadim Zhukov
 * @date   2016-06-27
 */
function ownPartsChange(event){
	// console.trace('-> ownPartsChange');

	let checked = $(this).prop('checked');

	newbid.setData({
		parts: Number(checked)
	});
}

/*********************************************** Certificate *************************************************/

function detectCert(callback){
	console.info('-> detectCert');

	let certificate = __CookieUtils.getCookie('certificate');

	if (certificate){
		__Certificate.check().then( (result) => {
			let exist = result.exist || null;
			let money = result.money || null;

			if (exist){
				__Popup.cert_confirm(money);
			}
		});
	} else {
		console.info('-> detectCert callback');
		if (typeof callback == 'function'){
			callback();
		}
	}
}

/*********************************************** Description *************************************************/

function descriptionChange(event){
	// console.trace('-> descriptionChange');

	let description = $(this).val() || '';

	newbid.setData({
		description: description
	});
}

function descriptionChange2(event){
	let description = uiWork.val() + "\r\n" + $(this).val() || '';

	newbid.setData({
		description: description
	});
}

/*********************************************** Date picker *************************************************/

/**
 * [initDatePicker Инициализация плагина календарь]
 * @author Vadim Zhukov
 * @date   2016-06-24
 */
function initDatePicker(event) {
	// console.trace('-> initDatePicker');
	$(".step #datepicker").datepicker({
		beforeShow: function(input, obj) { // Перед показом
			$(input).after( $(input).datepicker("option", "dateFormat", "dd.mm.yy") );
			$.datepicker.regional['ru'] = {
				minDate: "0",
				monthNames: ['Яварь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
				dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
				firstDay: 1,
			};
			$.datepicker.setDefaults( $.datepicker.regional['ru'] );
		},
		onSelect: function(input, obj) { // При выборе даты
			let time = $("#datepicker").datepicker('getDate').getTime()/1000 || null;
			
			newbid.setData({
				time: time
			});

			$('.step[data-step=4]').addClass('success');
		}
	});


	let timeFromBackend = newbid.getData('time');
	if (timeFromBackend){
		$('#datepicker').datepicker('setDate', timeFromBackend);
	}
}

/*********************************************** File uploader ***********************************************/

function fileUploaderGallery(result){
	let thumbsLoader = $('.fileUpload .thumbsLoader');
	let elements = thumbsLoader.find('> .thumb-element');
	let elementsLength = elements.length;
	let rel = thumbsLoader.attr('data-rel');

	if (elementsLength){

		elements.each(( idx, item ) => {
			let fancyClassExist = $(item).hasClass('fancybox');
			let src = $(item).find('.thumb-image').attr('src');
			let hash = $(item).attr('data-hash');

			$(item).wrap( '<a class="fancybox" rel="'+rel+'" href="'+src+'" data-hash="'+hash+'"></a>' );
		});
	}
}

/**
 * [initFileUploader Инициализация загрузчика файлов]
 * @author Vadim Zhukov
 * @date   2016-06-24
 */
function initFileUploader(event){
	// console.trace('-> initFileUploader');

	__ImageUploader.fileUploadInit(fileUploaded, fileRemoved, beforeFileUpload);

	$(".fileUpload .thumbsLoader .fancybox").fancybox({
		openEffect: 'none',
		closeEffect: 'none',
		padding: 0,
		margin: 10,
		topRatio: 0.5,
		leftRatio: 0.5,
		rightRatio: 0.5,
		fitToView: true,
		autoSize: true,
		autoCenter: true,
		helpers: {
			overlay : {
				showEarly  : true,
				locked     : true 
			}
		}
	});

}

/**
 * [fileUploaded Фото успешно загружено]
 * @author Vadim Zhukov
 * @date   2016-06-24
 * @param  {[type]}   result [description]
 */
function fileUploaded(result){
	// console.trace('-> fileUploaded');

	// Разблокируем кнопку отправки заявки
	uiSendFormButton.prop('disabled', '').removeClass('disabled');

	// Получаем массив уже загруженных фото
	let imgArrayFromBid = newbid.getData('img');

	let imgArray = [];
	for (let img in imgArrayFromBid) {
		imgArray.push(imgArrayFromBid[img]);
	}

	for (let image in result) {
		// Добавляем новые фото
		imgArray.push( result[image]['55'] );
	}

	// Сохраняем фото в заявку
	newbid.setData({
		img: imgArray
	});

	$('.step[data-step=3]').addClass('success');

	fileUploaderGallery();
}

/**
 * [fileRemoved При клике на удаление фотографии]
 * @author Vadim Zhukov
 * @date   2016-06-24
 * @param  {[type]}   input [element selector]
 */
function fileRemoved(input){
	// console.trace('-> fileRemoved');

	// let data_id = $(input).attr('data-id'); // id фото
	let thumbElement = $(input).parent('.thumb-element');
	let data_id = thumbElement.attr('data-hash'); // id фото

	$('.fileUpload .thumbsLoader .fancybox[data-hash='+data_id+']').remove();

	if (data_id){
		// Получаем массив уже загруженных фото
		let imgArrayFromBid = newbid.getData('img');
		let images = [];

		for (let img in imgArrayFromBid) {
			images.push(imgArrayFromBid[img]);
		}

		let imageslen = images.length;

		for (let i = 0, len = imageslen; i < len; i++) {
			let oneImage = images[i];

			if ( new RegExp(data_id).test( oneImage.split('/')[7] ) ) {
				images.splice(i, 1); // Если совпадает id фото - удаляем её из массива
				break;
			}
		}

		newbid.clearData('img');

		if (!images.length) {
			$('.step[data-step=3]').removeClass('success');
		} else {
			newbid.setData({
				img: images
			});
		}
	}
}

/**
 * [beforeFileUpload Перед загрузкой фотографии]
 * @author Vadim Zhukov
 * @date   2016-06-24
 */
function beforeFileUpload(event){
	// console.trace('-> beforeFileUpload');

	// Блокируем кнопку отправки заявки
	uiSendFormButton.prop('disabled', 'disabled').addClass('disabled');
}

/*********************************************** Auth/Reg/Rever **********************************************/

/**
 * [actionUserNameChange Изменения в input'е username]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionUserNameChange(event){
	// console.info('-> actionUserNameChange');

	let val = $(this).val() || '';
	let textError = $($(this)).siblings('.textError');
	let name = (val.length) ? true : false

	if (name){
		textError.text('').hide();
		$(this).removeClass('inputError').addClass('inputSuccess');
	} else {
		textError.text('Поле имя не может быть пустым').show();
		$(this).removeClass('inputSuccess').addClass('inputError');
	}

	newbid.changeValidate({
		userData: {
			name: name
		}
	});
}

/**
 * [actionUserPhoneChange Изменения в input'е phone]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionUserPhoneChange(event){
	// console.info('-> actionUserPhoneChange');

	let self = $(this);
	let val = self.val() || '';
	let textError = $(this).parents('.fluid-element').find('.textError');

	uiRegistrSend.show();

	ajaxCheckPhone(val).then( (result) => {
		let code = result.code || 0;
		let phone = false;

		switch (code) {
			case 0:
				console.error('Некорректный номер');
				textError.text('Некорректный номер').show();
				self.removeClass('inputSuccess').addClass('inputError');
				phone = false;
				break;

			case 1: 
				console.error('Номером телефона уже занят');
				textError.text('Номером телефона уже занят').show();
				self.removeClass('inputSuccess').addClass('inputError');
				phone = false;
				break;

			case 2:
				// console.info('Я такой телефон не нашел в базе среди подтверждённых');
				textError.text('').hide();
				self.removeClass('inputError').addClass('inputSuccess');
				phone = true;
				break;
		}

		newbid.changeValidate({
			userData: { phone: phone }
		});

	});
}

/**
 * [actionUserEmailChange Изменения в input'е email]
 * @author Vadim Zhukov
 * @date   2016-06-29
 */
function actionUserEmailChange(event){
	// console.info('-> actionUserEmailChange');

	let self = $(this);
	let val = self.val() || '';
	let textError = $(this).siblings('.textError');

	ajaxCheckEmail(val).then( (result) => {
		let code = result.code || 0;
		let email = false;

		switch (code) {
			case 0:
				console.error('Email не корректен');
				textError.text('Email не корректен').show();
				self.removeClass('inputSuccess').addClass('inputError');
				email = false;
				break;

			case 1: 
				console.error('Такой почтовый адрес уже занят');
				textError.text('Такой почтовый адрес уже занят').show();
				self.removeClass('inputSuccess').addClass('inputError');
				email = false;
				break;

			case 2:
				// console.info('Email корректен');
				textError.text('').hide();
				self.removeClass('inputError').addClass('inputSuccess');
				email = true;
				break;
		}

		newbid.changeValidate({
			userData: { email: email }
		});

	});
}

/**
 * [actionConfirmCode Клик по кнопке "Подтвердить" код]
 * @author Vadim Zhukov
 * @date   2016-06-28
 */
function actionConfirmCode(event){
	// console.info('-> actionConfirmCode');
	
	__Seo.reachGoal('bid_newbid_check_sms'); // Metrica цель: клик на кнопке регистрации при создании заявки, подтверждение смс

	preventExistEvent(event);
	var code = $('.sms_code').val();

	if (code.length){
		uiConfirmCodeButton.prop('disabled', 'disabled').addClass('disabled');
		ajaxRegisteruser(code, 0).then(registerUserCallback);
	}
}

/**
 * [openRegForm Показывает форму регистрации, скрывает форму авторизации]
 * @author Vadim Zhukov
 * @date   2016-05-17
 */
function openRegForm(event){
	// console.info('-> openRegForm');

	preventExistEvent(event);

	formAuth.hide();
	formRecover.hide();
	formReg.show();
}

/**
 * [openRegForm Показывает форму авторизации, скрывает форму регистрации]
 * @author Vadim Zhukov
 * @date   2016-05-17
 */
function openAuthForm(event){
	// console.info('-> openAuthForm');

	preventExistEvent(event);

	formReg.hide();
	formRecover.hide();
	formSms.hide();
	formAuth.show();
}

/**
 * [openRegForm Показывает форму восстановления пароля]
 * @author Vadim Zhukov
 * @date   2016-05-17
 */
function openReocverForm(event){
	// console.info('-> openReocverForm');

	preventExistEvent(event);

	formReg.hide();
	formAuth.hide();
	formSms.hide();
	formRecover.show();
}

/**
 * [actionRecover Восстановление пароля]
 * @author Vadim Zhukov
 * @date   2016-05-17
 */
function actionRecover(event){
	// console.info('-> actionRecover');

	preventExistEvent(event);

	let uiEmail = formRecover.find('input[name=email]');;
	let email = uiEmail.val();
	let textError = uiEmail.parents('.fluid-element').find('.textError');

	ajaxGetpass(email).then( (result) => {
		let success = result.success || false; // Успешность восстановления пароля
		let error = result.error || ''; // Текст ошибки
		let message = result.message || ''; // Текст при успешной отправки данных на email или телефон
		let textError = formRecover.find('.textError'); // Контейнер для вывода ошибки

		if (success) {
			textError.html(message);
			textError.text('').hide();
			uiEmail.removelass('inputError');
		} else {
			textError.html(error);

			console.error(error);
			textError.text(error).show();
			uiEmail.addClass('inputError');
		}
	});
}

/**
 * [actionLogin Клик по кнопке "Вход", авторизация пользователя]
 * @author Vadim Zhukov
 * @date   2016-06-24
 */
function actionLogin(event){
	// console.info('-> actionLogin');

	preventExistEvent(event);

	let uiEmail = formAuth.find('input[name=email]');
	let uiPassword = formAuth.find('input[name=password]');

	let email = uiEmail.val();
	let password = uiPassword.val();

	let textError = uiPassword.parent('.fluid-element').find('.textError');

	ajaxEnterUser(email, password).then( (result) => {
		let success = result.success || false; // Успешность восстановления пароля
		let error = result.error || ''; // Текст ошибки

		if (success) {
			newbid.changeValidate({
				steps: { 5: true }
			});

			uiStep5.hide();

			textError.text('').hide();
			uiPassword.removeClass('inputError');
			uiEmail.removeClass('inputError');
		} else {
			console.error('Пароль или логин указан неверно');
			textError.text('Пароль или логин указан неверно').show();
			uiPassword.addClass('inputError');
			uiEmail.addClass('inputError');
		}
	});
}

/**
 * [actionResendSMS Клик по ссылке "Отправить смс повторно"]
 * @author Vadim Zhukov
 * @date   2016-06-28
 */
function actionResendSMS(event){
	// console.info('-> actionResendSMS');

	preventExistEvent(event);

	$('.sms_code').val('');

	actionRegister();
}

/**
 * [actionRegister Клик по кнопке "Зарегистрироваться", регистрация пользователя]
 * @author Vadim Zhukov
 * @date   2016-06-28
 */
function actionRegister(event){
	// console.trace('-> actionRegister');

	__Seo.reachGoal('bid_newbid_cklick_bid'); // Metrica цель: клик на кнопке регистрации при создании заявки

	preventExistEvent(event);

	ajaxRegisteruser().then(registerUserCallback);
}

/**
 * [registerUserCallback Callback на ajax регистрация пользователя]
 * @author Vadim Zhukov
 * @date   2016-06-28
 * @param  {[json]}   result [ответ от сервера]
 */
function registerUserCallback(result){
	// console.trace('-> registerUserCallback');

	let success = result.success || false;
	let code = result.code || false;
	let uiSmsCode = $('.sms_code');
	let textErrorSmsCode = uiSmsCode.parents('.fluid-element').find('.textError');
	uiConfirmCodeButton.prop('disabled', '').removeClass('disabled');

	if (success){
		formSms.hide();
		uiStep5.hide();

		newbid.changeValidate({
			steps: { 5: true }
		});

		newbid.sendCar( () => {
			toastr["success"]("Регистрация прошла успешно!");
			formReg.show();

			detectCert( () => {
				actionSendBid();
			} );
		});
		

	} else {
		switch(code){
			case 1:
				formSms.show();
				newbid.changeValidate({
					userData: {
						sms: true
					}
				});
				toastr["success"]("Для завершения регистрации введите цифры кода, направленного на ваш телефон");
				textErrorSmsCode.text('').hide();
				uiSmsCode.removeClass('inputError');
				uiRegistrSend.hide();
				break;

			case 2:
				console.error('Телефон является обязательным полем');
				uiUserName.trigger('change');
				uiUserEmail.trigger('change');
				uiUserPhone.trigger('change');
				newbid.changeValidate({
					userData: {
						sms: false
					}
				});
				uiRegistrSend.show();
				break;

			case 4:
				console.error('Неверный код подтверждения телефона');
				textErrorSmsCode.text('Неверный код подтверждения телефона').show();
				uiSmsCode.addClass('inputError');
				newbid.changeValidate({
					userData: {
						sms: false
					}
				});
				break;
		}
	}
}

/*********************************************** Tools *******************************************************/

/**
 * [preventExistEvent Предотвращение дефолтных событий и всплытие событий]
 * @author Vadim Zhukov
 * @date   2016-05-17
 * @param  {[event]}   event [description]
 */
function preventExistEvent(event){
	if (event){
		event.preventDefault();
		event.stopPropagation();
	}
}

/*********************************************** I/O *********************************************************/

function ajaxSendBid(event) {
	// console.info('ajaxSendBid');

	let data = newbid.getData();

	return $.ajax({
		type: 'post',
		dataType: 'json',
		url: '/bid/create',
		data: data
	});
}

/**
 * [ajaxCheckEmail Валидация email'а]
 * @author Vadim Zhukov
 * @date   2016-06-29
 * @param  {String}   email [email]
 */
function ajaxCheckEmail(email = '') {
	// console.info('ajax_checkEmail');

	return $.ajax({
		type: 'post',
		url: '/user/checkattribute',
		data: { email: email },
		dataType: 'json'
	});
}

/**
 * [ajaxCheckPhone Валидация телефона]
 * @author Vadim Zhukov
 * @date   2016-06-29
 * @param  {String}   phone [номер телефона]
 */
function ajaxCheckPhone(phone = '') {
	phone = phone.replace(/[^0-9]*/g, '');

	return $.ajax({
		type: 'post',
		url: '/user/checkphone',
		data: { phone: phone },
		dataType: 'json'
	});
}

/**
 * [getpass ajax Восстановление пароля]
 * @author Vadim Zhukov
 * @date   2016-05-17
 * @param  {[sting]}   email [Email или номер телефона]
 * @return {[promise]}         [ajax]
 */
function ajaxGetpass(email = ''){
	// console.info('-> ajaxGetpass');

	return $.ajax({
		type: 'post',
		url: '/user/getpass',
		dataType: 'json',
		data: {
			email: email,
			ajax: 1
		}
	});
}

/**
 * [ajaxEnterUser ajax Авторизация пользователя]
 * @author Vadim Zhukov
 * @date   2016-05-17
 * @param  {[sting]}   email    [email или номер телефона]
 * @param  {[sting]}   password [пароль]
 * @return {[promise]}            [ajax]
 */
function ajaxEnterUser(email, password){
	// console.info('-> ajaxEnterUser');

	var email = email || '';
	var password = password || '';

	return $.ajax({
		type: 'post',
		url: '/user/enter',
		dataType: 'json',
		data: {
			email: email,
			password: password,
			ajax: 1
		}
	});
}

/**
 * [ajaxRegisteruser description]
 * @author Vadim Zhukov
 * @date   2016-05-17
 */
function ajaxRegisteruser(code = null, send_code = 1){
	// console.info('-> ajaxRegisteruser');

	let name = uiUserName.val() || '';
	let emailuser = uiUserEmail.val() || '';
	let phone = uiUserPhone.val() || '';

	return $.ajax({
		type: 'post',
		url: '/user/registeruser',
		dataType: 'json',
		data: {
			name: name,
			emailuser: emailuser,
			phone: phone,
			code: code,
			send_code: send_code,
			ajax: 1
		}
	});
}

/* ============================================= exports =================================================== */

module.exports = {

}