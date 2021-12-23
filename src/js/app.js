"use strict";
if ("serviceWorker" in navigator) {
	self.addEventListener("load", async () => {
		const container = navigator.serviceWorker;
		if (container.controller === null) {
			const reg = await container.register("sw.js");
		}
	});
}
// console.log(navigator);
const Cookie = {
	set: function (name, value, options = {}) {
		options = { path: '/', ...options };
		if (options.day != undefined) {
			options.expires = (new Date(Date.now() + (options.day * 24 * 60 * 60 * 1000))).toUTCString();
		} else {
			if (options.expires instanceof Date) options.expires = options.expires.toUTCString();
		}

		let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

		for (let optionKey in options) {
			updatedCookie += "; " + optionKey;
			let optionValue = options[optionKey];
			if (optionValue !== true) updatedCookie += "=" + optionValue;
		}

		document.cookie = updatedCookie;
	},
	remove: function (name) {
		this.set(name, '', { 'max-age': -1 });
	},
	get: function (name) {
		let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	},
	list: function () {
		let cookie = {};
		for (let item of document.cookie.split('; ')) {
			item = item.split('=');
			cookie[item[0]] = item[1];
		}
		return cookie;
	},
};

let test = false;
const testDuration = 1;

const randInt = (min, max, float = false) => {
	return (float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min) + min));
}
const randColor = () => {
	return `rgba(${randInt(0, 255)}, ${randInt(0, 255)}, ${randInt(0, 255)}, 1)`;
}

const isMobile = (window.outerWidth > 768 ? false : true);

const mobileViewbox = (clear = false) => {
	// return;
	if (!isMobile) return;
	document.querySelector(`body`).style.maxHeight = (clear ? '' : window.innerHeight + `px`);
	document.querySelector(`body`).style.minHeight = (clear ? '' : window.innerHeight + `px`);
	document.querySelector(`body`).style.height = (clear ? '' : window.innerHeight + `px`);
	// console.log(window);
	// console.log(window.outerHeight);
}

window.addEventListener(`resize`, () => {
	mobileViewbox();
});

const toggleFullScreen = () => {
	if (!isMobile) return;
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		mobileViewbox(1);
		document.documentElement.requestFullscreen();
	}
};

const toggleStartBox = () => {
	let open = document.querySelector(`.startBox--show`);
	let hide = document.querySelector(`.startBox--hide`);
	open.classList.toggle(`startBox--hide`);
	open.classList.toggle(`startBox--show`);
	setTimeout(() => {
		hide.classList.toggle(`startBox--absolute`);
		hide.classList.toggle(`startBox--hide`);
		hide.classList.toggle(`startBox--show`);
		open.classList.toggle(`startBox--absolute`);
	}, 400);
}

window.addEventListener(`load`, () => {
	mobileViewbox();

	for (const startBoxToggler of document.querySelectorAll(`.startBox__toggler`)) {
		startBoxToggler.addEventListener(`click`, (e) => {
			e.preventDefault();
			toggleStartBox();
		})
	}

	const preloader = () => {
		const Preloader = document.querySelector(`.Preloader`);
		setTimeout(() => {
			setTimeout(() => {
				Preloader.classList.add('Preloader--loaded');
			}, (test ? testDuration : 500));
		}, (test ? testDuration : 500));
	}

	preloader();

	for (const link of document.querySelectorAll(`.HeadSocs__link, .Footer__link`)) {
		link.addEventListener(`click`, function (e) {
			e.preventDefault();
			window.location.href = this.getAttribute('data-href');
			setTimeout(() => {
				window.location.href = this.getAttribute('href');
			}, 100);
		});
	}

	class Game {
		#results = null;
		#panels = {
			field: null,
			bttns: null,
			timer: null,
			info: null,
			start: null,
			bttnSave: null,
			form: null,
			results: null,
		}
		#addItemCount = 10; // кол-во итемов для добавления в тик по умолчанию
		#randomAddCount = true; // Включить геннерацию рандомного числла для добавления новы итемов в тик.
		#randAddCountMin = 10;
		#randAddCountMax = 25;
		#intervalIds = {
			autoAdd: null,
			autoClear: null,
			timer: null,
		}
		#autoAddInterval = 1; // sec
		#startItemsCount = 15;
		#maxItemCountOnField = 300;
		#bonusStickers = [4, 11, 13];
		#stickerBonusCount = 2;
		#itemMinScale = 1.5;
		#itemMaxScale = 2.5;
		#gameDuration = 5; // сек
		#currentTime = 0;
		#score = 0;
		#generatedItemCount = {
			all: 0,
		};
		#itemsCount = 0;
		#proportion = {};
		#items = [
			{ name: "Виски-кола", proportion: 15, className: 'cocktail', addBonus: true }, { name: "Лимончело", proportion: 15, className: 'shot', addBonus: true }, { name: "Медведь в новогодней шапке", proportion: 15, className: 'nybear', addBonus: true }, { name: "Ёлочные шары", proportion: 15, className: 'balls', addBonus: true }, { name: "Ёлка", proportion: 15, className: 'tree', addBonus: true }, { name: "Стикеры из телеги", proportion: 60, className: 'sticker', addBonus: false, }, { name: "Пицца", proportion: 15, className: 'pizza', addBonus: true },
		];

		#randInt(min, max, float = false) {
			return (float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min) + min));
		}

		#randColor() {
			return `rgba(${this.#randInt(0, 255)}, ${this.#randInt(0, 255)}, ${this.#randInt(0, 255)}, 1)`;
		}

		constructor(gameDuration = false) {
			if (gameDuration)
				this.#gameDuration = gameDuration;
			this.#loadElements();
			this.#events();
		}

		#resetStats(global = true) {
			this.#itemsCount = 0;
			if (global)
				this.#generatedItemCount = { all: 0 };
			this.#proportion = {};
		}

		#updateStats(item) {
			let attr = (item.tagName == 'DIV' ? item.getAttribute(`data-type`) : item.className);
			this.#itemsCount++;
			this.#proportion[attr].count++;
			this.#proportion[attr].rate = this.#calcProportion(this.#itemsCount, this.#proportion[attr].count);

			this.#generatedItemCount.all++;
			if (typeof this.#generatedItemCount[attr] == 'undefined')
				this.#generatedItemCount[attr] = 0;
			this.#generatedItemCount[attr]++;
		}

		#calcProportion(all, current) {
			return current * 100 / all;
		}

		#itemsProportions(item) {
			let attr = (item.tagName == 'DIV' ? item.getAttribute(`data-type`) : item.className);

			if (typeof this.#proportion[attr] == 'undefined')
				this.#proportion[attr] = { count: 0, rate: 0 };

			if (this.#calcProportion(this.#itemsCount + 1, this.#proportion[attr].count + 1) >= item.proportion) {
				return false;
			} else {
				return item;
			}
		}

		#removeOldItems() {
			// console.log('removeOldItems');
			this.#resetStats(false);
			let i = this.#maxItemCountOnField / 2;
			for (const item of this.#panels.field.querySelectorAll(`*`)) {
				if (i > 0) {
					item.classList.add('old');
					this.#addBonus(item, true);
				} else {
					this.#itemsProportions(item);
					this.#updateStats(item);
				}
				i--;
			}
		}

		#getPrototypeItem() {
			let item = false;

			if (this.#startItemsCount > this.#itemsCount) {
				item = this.#items[this.#randInt(0, this.#items.length - 1)];
				this.#itemsProportions(item);
			} else {
				while (item == false) {
					item = this.#itemsProportions(this.#items[this.#randInt(0, this.#items.length - 1)]);
				}
			}

			this.#updateStats(item);

			if (this.#maxItemCountOnField < this.#itemsCount)
				this.#removeOldItems();
			return item;
		}

		#genItem() {
			let prototype = this.#getPrototypeItem();

			let item = document.createElement('div');
			item.setAttribute('data-type', prototype.className);
			item.classList.add('new');
			item.classList.add('Game__item');
			item.classList.add('Game__item--' + prototype.className);
			if (prototype.addBonus === true)
				item.classList.add('bonus');
			if (prototype.className == 'nybear')
				item.classList.add('Game__item--' + prototype.className + `--` + this.#randInt(1, 3));
			if (prototype.className == 'pizza')
				item.classList.add('Game__item--' + prototype.className + `--` + this.#randInt(1, 2));
			if (prototype.className == 'balls')
				item.classList.add('Game__item--' + prototype.className + `--` + this.#randInt(1, 4));
			if (prototype.className == 'sticker') {
				let id = this.#randInt(1, 16);
				item.classList.add('Game__item--' + prototype.className + `--` + id);
				if (this.#bonusStickers.includes(id)) // Бонусные стикеры>
					item.classList.add('bonus', `sticker`);
			}
			item.style.top = this.#randInt(0, 100) + '%';
			item.style.left = this.#randInt(0, 100) + '%';
			item.style.transform = `translate(-50%, -50%) rotate(${this.#randInt(0, 359)}deg) scale(${this.#randInt(this.#itemMinScale, this.#itemMaxScale, 1)})`;

			return item;
		}

		#addMoreItems(start = false) {
			for (let index = (start ? this.#startItemsCount : (this.#randomAddCount ? this.#randInt(this.#randAddCountMin, this.#randAddCountMax) : this.#addItemCount)); index > 0; index--) {
				let item = this.#genItem();
				setTimeout(() => {
					this.#panels.field.append(item);
					setTimeout(() => {
						item.classList.remove(`new`);
					}, 50);
				}, this.#randInt(150, 1500));
			}
		}

		#clearField() {
			for (const el of this.#panels.field.querySelectorAll(`*`))
				el.remove();
		}

		#autoAdd() {
			this.#intervalIds.autoAdd = setInterval(() => {
				this.#addMoreItems();
			}, this.#autoAddInterval * 1000);
		}

		#autoClearClicked() {
			this.#intervalIds.autoClear = setInterval(() => {
				for (const item of this.#panels.field.querySelectorAll(`.clicked`))
					item.remove();
			}, 2000);
		}

		#setTimerVal() {
			let min = Math.floor(this.#currentTime / 60);
			let sec = this.#currentTime - (min * 60)
			this.#panels.timer.querySelector(`b`).innerText = `${min}:` + (sec < 10 ? '0' + sec : sec);
		}

		#timer() {
			this.#currentTime = this.#gameDuration;
			this.#setTimerVal();
			this.#intervalIds.timer = setInterval(() => {
				this.#currentTime--;
				this.#setTimerVal();
				if (this.#currentTime == 0)
					this.stop();
				if (test)
					this.#consoleProportion();
			}, 1000);
		}

		#consoleProportion() {
			let str = [];
			for (const key in this.#proportion) {
				str.push(`[${this.#proportion[key].count}/${this.#generatedItemCount[key]}] ${key} - ${this.#proportion[key].rate}`);
			}
			console.log(str.join("\n"));

			console.log(`generatedItemCount	=>	` + this.#generatedItemCount.all);
			console.log(`itemsCount	=>	` + this.#itemsCount);
		}

		#stopIntervals() {
			for (const key in this.#intervalIds)
				clearInterval(this.#intervalIds[key]);
		}

		#clearScore() {
			this.#score = 0;
			this.#refreshScore();
		}

		#togglePanel(panel, show = false) {
			if (show) {
				this.#panels[panel].classList.remove('hide');
			} else {
				this.#panels[panel].classList.add('hide');
			}
		}

		#refreshScore() {
			this.#panels.info.querySelector(`b`).innerText = this.#score;
		}

		start() {
			this.#clearField();
			this.#clearScore();
			this.#togglePanel('bttns');
			this.#togglePanel('timer', 1);
			this.#togglePanel('info', 1);
			this.#togglePanel('field', 1);
			this.#togglePanel('start');
			this.#togglePanel('end');
			this.#addMoreItems(true);
			this.#timer();
			this.#autoAdd();
			this.#autoClearClicked();
		}

		stop() {
			this.#stopIntervals();
			this.#clearField();
			this.#togglePanel('bttns', 1);
			this.#togglePanel('timer', 0);
			this.#togglePanel('info', 0);
			this.#togglePanel('field', 0);
			this.#togglePanel('start', 0);
			this.#togglePanel('bttnSave', 1);
			this.#togglePanel('bttnStart', 0);
			this.#togglePanel('bttnRestart', 1);
			this.#resetStats();

			this.#setEndResult();
			this.#togglePanel('end', 1);
		}

		#setEndResult() {
			this.#panels.end.querySelector(`b`).innerText = this.#score;
			this.#panels.end.querySelector(`input[name='score']`).value = this.#score;
			if (Cookie.get('instagram') != undefined)
				this.#panels.end.querySelector(`input[name='instagram']`).value = Cookie.get('instagram');
		}

		#loadElements() {
			this.#panels.field = document.querySelector(`.Game__field`);
			this.#panels.bttns = document.querySelector(`.Game__bttns`);
			this.#panels.info = document.querySelector(`.Game__info`);
			this.#panels.timer = document.querySelector(`.Game__timer`);
			this.#panels.start = document.querySelector(`.Game__start`);
			this.#panels.end = document.querySelector(`.Game__end`);
			this.#panels.bttnSave = document.querySelector(`.Game__bttn--save`);
			this.#panels.bttnRestart = document.querySelector(`.Game__bttn--restart`);
			this.#panels.bttnStart = document.querySelector(`.Game__bttn--start`);
			this.#panels.bttnResults = document.querySelector(`.Game__bttn--results`);
			this.#panels.form = document.querySelector(`.Game__save`);
			this.#panels.results = document.querySelector(`.Game__results`);
			this.#panels.results = document.querySelector(`.Game__results`);
			this.#panels.tbody = this.#panels.results.querySelector('tbody');

		}

		#addBonus(item, noBonus = false) {
			item.classList.add(`clicked`);
			if (item.classList.contains(`bonus`) && !noBonus) {
				this.#score += (item.classList.contains(`sticker`) ? this.#stickerBonusCount : 1);
			}
		}

		async #loadResults() {
			let response = null;
			try {
				response = await fetch('https://gfwe.ru/mishkabar/game/');
			} catch (error) {
				alert('Ошибка при загрузке');
			}
			let data = await response.json();
			// console.log(data);
			this.#results = data;
			this.#genResults();
		}

		#genTd(text = '') {
			let td = document.createElement('td');
			td.innerText = text;
			return td;
		}

		#genTr(id, date, instagram, score) {
			let tr = document.createElement('tr');
			if (Cookie.get('instagram') == instagram)
				tr.classList.add('you');
			tr.setAttribute('data-id', id);
			tr.setAttribute('data-date', date);
			tr.append(this.#genTd());
			// tr.append(this.#genTd(date));
			tr.append(this.#genTd(instagram));
			tr.append(this.#genTd(score));
			return tr;
		}

		#clearResults() {
			this.#panels.tbody.innerHTML = '';
		}

		#genResults() {
			this.#clearResults();
			for (const res of this.#results) {
				this.#panels.tbody.append(this.#genTr(res.id, res.date, res.instagram, res.score));
			}
		}

		#openResults(openEnd = false) {
			if (!openEnd) {
				this.#togglePanel('start', 1);
				this.#togglePanel('end');
			}
			this.#togglePanel('results', 1);
			this.#loadResults();
		}

		async #saveResult() {
			const fd = new FormData(this.#panels.form);
			Cookie.set('score', fd.get(`score`));
			Cookie.set('instagram', fd.get(`instagram`));
			this.#panels.form.reset();
			// console.log(fd);
			let response = null;
			try {
				response = await fetch('https://gfwe.ru/mishkabar/game/', {
					method: 'POST',
					body: fd
				});
			} catch (error) {
				alert('Ошибка при загрузке');
			}
			let result = await response.json();
			console.log(result);

			if (result.status) {
				this.#openResults();
			} else {
				alert(`Произошла ошибка при сохранении: (`);
			}
			// console.log(result);
		}

		#events() {
			this.#panels.bttnRestart.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.start();
			});
			this.#panels.bttnStart.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.start();
				toggleFullScreen();
			});

			this.#panels.field.addEventListener(`click`, (e) => {
				this.#addBonus(e.target);
				this.#refreshScore();
			});

			this.#panels.form.addEventListener(`submit`, (e) => {
				e.preventDefault();
				this.#saveResult();
			});

			this.#panels.bttnResults.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.#openResults();
			});

			this.#panels.results.querySelector(`.Bttn`).addEventListener(`click`, (e) => {
				e.preventDefault();
				this.#togglePanel('results');
			});
		}
	}

	const game = new Game(90);

	window.addEventListener(`keypress`, function (e) {
		// console.log(e);
		if (e.keyCode == 116)
			test = !test;
		if (e.keyCode == 99)
			console.log(Cookie.list());
		if (e.keyCode == 115 && test) {
			game.stop();
			game.start();
		}
	});

	const animatePoint = (count) => {
		for (let index = 0; index < 100; index = index + (100 / count)) {
			console.log(Math.ceil(index));
		}
	}

	// function autoClick() {
	// 	let id = setInterval(() => {
	// 		for (const el of document.querySelectorAll(`.Game__item `)) {
	// 			el.click();
	// 		}
	// 	}, 500);
	// 	setTimeout(() => {
	// 		clearInterval(id)
	// 	}, 90 * 1000);
	// }
	// autoClick();
	// console.log(window.screen);

	// alert(window.innerHeight);
	// alert(window.outerHeight);
	// alert(window.screen.availHeight);
	// alert(window.screen.height);
});