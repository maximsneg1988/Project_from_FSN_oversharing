class Hack {
	constructor(post, options) {
		// ДЕФОЛТНЫЕ ОПЦИИ
		const defaultConfig = {
			article: {
				neccesary: {
					birthday: "Сегодня 17 мая - день, когда я появилась на свет !",
					adress: "Мой уютный уголок!",
					travel: "Провели выходные в Сосновке. Обожаю это место!",
					pet: "Вернулись с Барни с прогулки. Он устал, я тоже...",
					phone: "Нужен хороший мастер по ремонту. Писать в личку или на +7 987 654-32-10",
				},
				scores: {
					one: "У меня один пароль на всё. Иначе я бы вообще нигде не входила.",
					two: "Отправляюсь в путешествие",
					three: "г. Казань",
				},
				useless: {
					first: "Главный повар дома:",
					second: "Новенький маникюр",
				},
			},
			check: {
				birthday: "Дата рождения",
				adress: "Адрес или город проживания",
				phone: "Телефон",
				pet: "Имя домашнего животного",
				travel: "Последнее место, где был пользователь",
				email: "E-mail (если найдёшь)",
			},
		};
		this.options = Object.assign(defaultConfig, options);

		this.post = post || ".post";
		this.posts = document.querySelectorAll(post);
		this.emailStorage = {};

		this.createConfirm();
		this.sendBtn = document.querySelector("#send");
		this.cancelBtn = document.querySelector("#cancel");
		this.popup = document.querySelector(".popup");

		this.endLevel = document.querySelector("#end-level");
		this.endLevel.addEventListener("click", (e) => this.createCallbackWindow(e, this.createCallbackBlank()));

		this.createCounter();
		this.counter = document.querySelector(".counter");

		// Бланк для подсчета ОБЯЗАТЕЛЬНЫХ ЗАДАНИЙ
		this.checkBlank = {
			birthday: null,
			adress: null,
			phone: null,
			pet: null,
			travel: null,
			email: null,
		};

		// Бланк для подсчета ДОПОЛНИТЕЛЬНЫХ БАЛЛОВ
		this.extraBlank = {
			one: null,
			two: null,
			three: null,
		};

		// Бланк для подсчета БЕСПОЛЕЗНЫХ ЗАДАНИЙ
		this.uselessBlank = {
			first: null,
			second: null,
		};

		this.lastScore = 0;
	}

	// ПРОСЛУШИВАЕМ ВЫДЕЛЕНИЕ МЫШКОЙ
	listener() {
		window.addEventListener("mouseup", (e) => this.getText(e));
		window.addEventListener("mouseup", (e) => this.getTextImage(e));
	}
	// НАХОДИМ ТЕКСТ КЛИКОМ ПО ИЗОБРАЖЕНИЮ
	getTextImage(e) {
		e.preventDefault();
		const posts = document.querySelector(".posts");
		const aboutList = document.querySelector("#about-list");

		if (posts.contains(e.target) || aboutList.contains(e.target)) {
			const postImageTrue = e.target.parentNode.classList.contains("post-image");
			const message = e.target.parentNode.parentNode.querySelector(".post-message");

			if (postImageTrue && message) {
				const virtualNode = document.createElement("div");
				const clone = message.cloneNode(true);

				virtualNode.appendChild(clone);
				let strong = virtualNode.querySelector("strong");
				strong.remove();

				const finallyText = virtualNode
					.querySelector(".post-message")
					.textContent.toString()
					.trim()
					.replace(/\r?\n|\r/g, " ");

				this.addEmailStorage(finallyText);
				this.checkStart(finallyText);
				return finallyText;
			}
		}
		return;
	}

	// НАХОДИМ ТЕКСТ ВЫДЕЛЕНИЕМ МЫШКИ
	getText(e) {
		e.preventDefault();
		// получаем выделенный текст
		const posts = document.querySelector(".posts");
		const aboutList = document.querySelector("#about-list");

		if (window.getSelection().baseNode && (posts.contains(e.target) || aboutList.contains(e.target))) {
			let workingText = window
				.getSelection()
				.baseNode.data.toString()
				.trim()
				.replace(/\r?\n|\r/g, " ");

			if (workingText && workingText.length < 150) {
				this.addEmailStorage(workingText);
				this.checkStart(workingText);
				return workingText;
			}
			return;
		}
	}

	// ДОБАВЛЯЕМ ПОЧТУ В ХРАНИЛИЩЕ
	addEmailStorage(selectedText) {
		let newEmails = this.emailExtract(selectedText);
		if (newEmails) {
			for (let i = 0; i < newEmails.length; i++) {
				this.emailStorage[`email-${i}`] = newEmails[i];
			}
		}
	}

	// НАЧАЛО ПРОВЕРКИ ЧЕК-ЛИСТА
	checkStart(text) {
		if (text) {
			this.popup.classList.add("show");

			const popupWindow = this.popup.querySelector(".popup-message");
			popupWindow.textContent = text;

			this.sendBtn.addEventListener("click", (e) => this.checkEnd(e, text));
			this.cancelBtn.addEventListener("click", (e) => this.cancel(e));
		}
	}

	// ОКОНЧАНИЕ ПРОВЕРКИ ЧЕК-ЛИСТА
	checkEnd(e, text) {
		e.preventDefault();

		this.checkEmail();
		this.checkStrike(text);
		this.checkExtra(text);
		this.checkUseless(text);
		this.cancel();
	}

	// НАХОДИМ КЛЮЧ ДЛЯ ТЕКСТОВОГО ЗНАЧЕНИЯ
	findKeyValueContainingText(object, searchText) {
		for (let key in object) {
			if (object.hasOwnProperty(key)) {
				if (typeof object[key] === "string" && object[key].includes(searchText)) {
					return { key: key, value: object[key] };
				}
			}
		}
		return undefined;
	}

	// ОТРАБАТЫВАЕМ ПОЧТУ (МЕНЯЕМ В ЧЕК ЛИСТЕ И ДОБАВЛЯЕМ В БЛАНК)
	checkEmail() {
		if (this.hasOwnValue(this.emailStorage)) {
			const checkList = document.querySelector("#check-list");
			const all = checkList.querySelectorAll("li span");

			const stringLiteral = Object.entries(this.emailStorage)
				.map(([key, value]) => value)
				.join(", ");

			all.forEach((span) => {
				if (span.textContent === this.options.check.email) {
					span.textContent = "Доп.информация: " + stringLiteral;
					span.style.color = "red";
				}
			});
			this.checkBlank["email"] = 5;
			this.lastScore = 5;
		}
	}

	// ДОБАВЛЯЕМ ДОП БАЛЛЫ В БЛАНК
	checkExtra(text) {
		const foundEntry = this.findKeyValueContainingText(this.options.article.scores, text);
		if (foundEntry) {
			var key = foundEntry.key;
		} else {
			return;
		}
		this.extraBlank[key] = 5;
		this.lastScore = 5;
	}

	// ЗАНОСИМ БЕСПОЛЕЗНЫЕ В БЛАНК
	checkUseless(text) {
		const foundEntry = this.findKeyValueContainingText(this.options.article.useless, text);
		if (foundEntry) {
			var key = foundEntry.key;
		} else {
			return;
		}
		this.uselessBlank[key] = 1;
		this.lastScore = "БЕСПОЛЕЗНЫЙ ПОСТ";
	}

	// ВЫЧЕРКИВАНИЕ ИЗ ЧЕК-ЛИСТА
	checkStrike(text) {
		const foundEntry = this.findKeyValueContainingText(this.options.article.neccesary, text);
		if (foundEntry) {
			var key = foundEntry.key;
		} else {
			return;
		}
		const checkValue = this.options.check[key];

		this.checkBlank[key] = 10;

		const checkList = document.querySelector("#check-list");
		const all = checkList.querySelectorAll("li span");
		all.forEach((span) => {
			if (span.textContent === checkValue) {
				span.style.textDecoration = "line-through";
				span.style.color = "red";
			}
		});
		this.lastScore = 10;
	}

	// СКЛАДЫВАЕМ БАЛЛЫ И ПОКАЗЫВАЕМ
	showScore() {
		let sum = 0;
		for (const key in this.checkBlank) {
			if (this.checkBlank.hasOwnProperty(key)) {
				const value = this.checkBlank[key];
				if (typeof value === "number") {
					sum += value;
				}
			}
		}
		for (const key in this.extraBlank) {
			if (this.extraBlank.hasOwnProperty(key)) {
				const value = this.extraBlank[key];
				if (typeof value === "number") {
					sum += value;
				}
			}
		}
		console.clear();
		console.log(sum);
		return sum;
	}

	// КНОПКА ОТМЕНА
	cancel(e) {
		this.popup.classList.remove("show");
		this.sendBtn.parentNode.classList.remove("show");

		// Удаляем прослушиватели с кнопки ОТПРАВИТЬ И ОТМЕНА
		const newSend = this.sendBtn.cloneNode(true); // true для клонирования с потомками
		this.sendBtn.parentNode.replaceChild(newSend, this.sendBtn);

		const newCancel = this.cancelBtn.cloneNode(true); // true для клонирования с потомками
		this.cancelBtn.parentNode.replaceChild(newCancel, this.cancelBtn);

		this.sendBtn = document.querySelector("#send");
		this.cancelBtn = document.querySelector("#cancel");

		this.checkWin();
	}

	// Проверка на выиграш
	checkWin() {
		if (this.counter) {
			this.counter.classList.add("show");
			this.counter.textContent = this.showScore();
		}
		if (this.showScore() === 70) {
			this.createCallbackWindow(null, this.createCallbackBlank());
			return;
		}
	}

	// НАХОДИМ ПОЧТУ В ТЕКСТЕ
	emailExtract(text) {
		// Регулярное выражение для поиска email-адресов
		const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
		const emails = text.match(emailRegex);
		return emails;
	}

	// ПРОВЕРКА ПУСТОЙ ЛИ ОБЪЕКТ
	hasOwnValue(obj) {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (obj[key]) {
					return true; // Найдено truthy значение
				}
			}
		}
		return false; // Truthy значения не найдены
	}

	// ОКНО С КНОПКАМИ ДЛЯ ПОДТВЕРЖДЕНИЯ ОТПРАВКИ
	createConfirm() {
		let html = `                
        <div class="popup">
    	<div class="popup-inner">
    		<div class="popup-message">ПРИВЕТИК</div>
    		<div class="popup-buttons">
    			<button id="send">ОТПРАВИТЬ</button>
    			<button id="cancel">ОТМЕНА</button>
    		</div>
    	</div>
        </div>`;
		const body = document.querySelector("body");
		body.insertAdjacentHTML("beforeend", html);
	}

	// ФОРМИРУЕМ СПИСОК ДОСТИЖЕНИЙ ДЛЯ ВЫВОДА В БЛАНКЕ ОБРАТНОЙ СВЯЗИ
	concatAchivments(obj) {
		let concated = "";
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const value = obj[key];
				if (typeof value === "string") {
					concated += "<p>" + value + "</p>";
				}
			}
		}
		return concated;
	}

	// СРАВНЕНИЕ ОБЪЕКТОВ ДЛЯ ВЫВОДА ДОСТИЖЕНИЙ В ОКНЕ ОБРАТНОЙ СВЯЗИ
	compareObjects(obj1, obj2) {
		const result = {};
		for (const key in obj1) {
			if (obj1.hasOwnProperty(key)) {
				if (obj2.hasOwnProperty(key) && obj2[key]) {
					result[key] = "<p class='tal dot-before'>" + obj1[key] + " + " + obj2[key] + "</p>";
				}
			}
		}
		return result;
	}

	// ФОРМИРУЕМ ОТЧЕТ ОБ ИГРЕ
	createCallbackBlank() {
		let html = ``;
		const title = `<p class="tac"><strong>Ты собрал ${this.showScore()} из 70 возможных баллов. Нашел:</strong></p>`;
		const checkObj = this.compareObjects(this.options.check, this.checkBlank);
		const scoresObj = this.compareObjects(this.options.article.scores, this.extraBlank);

		const neccesary = `${this.concatAchivments(checkObj)}`;
		const scores = `${this.concatAchivments(scoresObj)}`;

		const footerSucces = `<p class="tar">…</p>
			<p class="tar"><strong>Письмо от “команды хакеров”</strong></p>
			<p class="tar"><strong>«Хорошая работа.</strong> Ты показал(а), что умеешь собирать информацию. Жертва даже не подозревает, сколько всего мы о ней узнали. Такие, как она — легкая добыча.</p>
			<p class="tar">⚠️ Помни: мы просто копаем то, что она сама выложила. Без взломов. Просто открытый интернет.»</p>
			<p class="tar"><strong>Подсказка для игрока (но от лица "хакеров")</strong></p>
 			<p class="tar">Мягкий переход от игры к реальности:</p>
			<p class="tar">📌 Заметка на будущее</p>
			<p class="tar">«Один пост с номером телефона+ один с датой рождения = сброс пароля. А если еще и почту найдешь — дело сделано. Люди не понимают, насколько это просто.</p>
			<p class="tar">Хорошо, что ты теперь знаешь.»</p>
			<p class="tar"><strong>Фраза-завязка на следующий уровень / переход:</strong></p>
			<p class="tar">Следующий профиль будет посложнее. Не всё лежит на поверхности — придётся копать. Покажи, что ты умеешь не только кликать по ярким постам.</p>
			<br><p class="tar">Кнопка: <a href="index1.html"><strong>[Перейти к следующей задаче]</strong></a></p>`;

		const footerMiss = `<p class="tar">…</p>
			<p class="tar"><strong>Письмо от “команды хакеров”</strong></p>
			<p class="tar"><strong>«Плохая работа.</strong> Ты показал(а), что не умеешь собирать информацию.</p>			
			<p class="tar">Чтобы пройти дальше набери хотя бы 30 баллов !</p>
			<br><p class="tar">Кнопка: <a href="index2.html"><strong>[Повторить]</strong></a></p>`;

		html += title;
		html += `<div class="myrow"><div class="mycolumn"></div><div class="mycolumn">`;
		html += neccesary;
		html += `</div></div>`;

		// Выводим ДОПОЛНИТЕЛЬНЫЕ БАЛЫ, если они есть
		if (this.hasOwnValue(this.extraBlank)) {
			html += `<p class="tac"><strong>Дополнительно:</strong></p>`;
			html += `<div class="myrow"><div class="mycolumn"></div><div class="mycolumn">`;
			html += scores;
			html += `</div></div>`;		
		}

		// Выводим предупреждение о БЕСПОЛЕЗНЫХ постах
		if (this.hasOwnValue(this.uselessBlank)) {
			html += '<p class="tac"><strong>Ненужная информация. Больше так не делай</strong></p>';
		}

		// Выводим ПИСЬМО ОТ ХАКЕРОВ в зависимости от вашего успеха
		if (this.hasOwnValue(this.checkBlank) && Number(this.showScore()) >= 30) {
			html += footerSucces;
		} else {
			html += footerMiss;
		}

		return html;
	}

	// СОЗДАЕМ ОКНО ВКОНЦЕ ИГРЫ
	createCallbackWindow(e, blank) {
		let html = `                
        <div class="popup-callback">
    	<div class="popup-callback_inner">
    		<div class="popup-callback_message">${blank}</div>    		
    	</div>
        </div>`;
		const body = document.querySelector("body");
		body.insertAdjacentHTML("beforeend", html);
		const popup = document.querySelector(".popup-callback");
		popup.classList.add("show");
	}

	// СОЗДАЕМ СЧЕТЧИК БАЛОВ
	createCounter() {
		let html = `<div class="counter"></div>`;
		const body = document.querySelector("body");
		body.insertAdjacentHTML("beforeend", html);
	}
}

// ---------------------------------------------------------------------------------------------------------------------
// ИНИЦИАЛИЗИРУЕМ ЕКЗЕМПЛЯР ИГРЫ - УРОВЕНЬ 1
//----------------------------------------------------------------------------------------------------------------------

const newHack = new Hack(".post", {
	article: {
		neccesary: {
			birthday: "Сегодня 17 мая - день, когда я появилась на свет !",
			adress: "Мой уютный уголок!",
			travel: "Провели выходные в Сосновке. Обожаю это место!",
			pet: "Вернулись с Барни с прогулки. Он устал, я тоже...",
			phone: "Нужен хороший мастер по ремонту. Писать в личку или на +7 987 654-32-10",
		},
		scores: {
			one: "У меня один пароль на всё. Иначе я бы вообще нигде не входила.",
			two: "Отправляюсь в путешествие",
			three: "г. Казань",
		},
		useless: {
			first: "Главный повар дома:",
			second: "Новенький маникюр",
		},
	},
	check: {
		birthday: "Дата рождения",
		adress: "Адрес или город проживания",
		phone: "Телефон",
		pet: "Имя домашнего животного",
		travel: "Последнее место, где был пользователь",
		email: "E-mail (если найдёшь)",
	},
}).listener();
