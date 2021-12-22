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
	if (!isMobile) return;
	document.querySelector(`body`).style.maxHeight = (clear ? '' : window.outerHeight + `px`);
	document.querySelector(`body`).style.minHeight = (clear ? '' : window.outerHeight + `px`);
}

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
		}, (test ? testDuration : 1000));
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
		_results = null;
		_panels = {
			field: null,
			bttns: null,
			timer: null,
			info: null,
			start: null,
			bttnSave: null,
			form: null,
			results: null,
		}
		_addItemCount = 100; // кол-во итемов для добавления в тик по умолчанию
		_randomAddCount = true; // Включить геннерацию рандомного числла для добавления новы итемов в тик.
		_randAddCountMin = 5;
		_randAddCountMax = 15;
		_intervalIds = {
			autoAdd: null,
			autoClear: null,
			timer: null,
		}
		_autoAddInterval = 1; // sec
		_startItemsCount = 15;
		_maxItemCountOnField = 300;
		_bonusStickers = [4, 11, 13];
		_stickerBonusCount = 2;
		_itemMinScale = 1.5;
		_itemMaxScale = 2.5;
		_gameDuration = 5; // сек
		_currentTime = 0;
		_score = 0;
		_generatedItemCount = {
			all: 0,
		};
		_itemsCount = 0;
		_proportion = {};
		_items = [
			{ name: "Виски-кола", proportion: 15, className: 'cocktail', addBonus: true }, { name: "Лимончело", proportion: 15, className: 'shot', addBonus: true }, { name: "Медведь в новогодней шапке", proportion: 15, className: 'nybear', addBonus: true }, { name: "Ёлочные шары", proportion: 15, className: 'balls', addBonus: true }, { name: "Ёлка", proportion: 15, className: 'tree', addBonus: true }, { name: "Стикеры из телеги", proportion: 60, className: 'sticker', addBonus: false, }, { name: "Пицца", proportion: 15, className: 'pizza', addBonus: true },
		];

		randInt(min, max, float = false) {
			return (float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min) + min));
		}

		randColor() {
			return `rgba(${this.randInt(0, 255)}, ${this.randInt(0, 255)}, ${this.randInt(0, 255)}, 1)`;
		}

		constructor(gameDuration = false) {
			if (gameDuration)
				this._gameDuration = gameDuration;
			this.loadElements();
			this.events();
		}

		resetStats(global = true) {
			this._itemsCount = 0;
			if (global)
				this._generatedItemCount = { all: 0 };
			this._proportion = {};
		}

		updateStats(item) {
			let attr = (item.tagName == 'DIV' ? item.getAttribute(`data-type`) : item.className);
			this._itemsCount++;
			this._proportion[attr].count++;
			this._proportion[attr].rate = this.proportion(this._itemsCount, this._proportion[attr].count);

			this._generatedItemCount.all++;
			if (typeof this._generatedItemCount[attr] == 'undefined')
				this._generatedItemCount[attr] = 0;
			this._generatedItemCount[attr]++;
		}

		proportion(all, current) {
			return current * 100 / all;
		}

		itemsProportions(item) {
			let attr = (item.tagName == 'DIV' ? item.getAttribute(`data-type`) : item.className);

			if (typeof this._proportion[attr] == 'undefined')
				this._proportion[attr] = { count: 0, rate: 0 };

			if (this.proportion(this._itemsCount + 1, this._proportion[attr].count + 1) >= item.proportion) {
				return false;
			} else {
				return item;
			}
		}

		removeOldItems() {
			// console.log('removeOldItems');
			this.resetStats(false);
			let i = this._maxItemCountOnField / 2;
			for (const item of this._panels.field.querySelectorAll(`*`)) {
				if (i > 0) {
					this.addBonus(item, true);
				} else {
					this.itemsProportions(item);
					this.updateStats(item);
				}
				i--;
			}
		}

		getPrototypeItem() {
			let item = false;

			if (this._startItemsCount > this._itemsCount) {
				item = this._items[this.randInt(0, this._items.length - 1)];
				this.itemsProportions(item);
			} else {
				while (item == false) {
					item = this.itemsProportions(this._items[this.randInt(0, this._items.length - 1)]);
				}
			}

			this.updateStats(item);

			if (this._maxItemCountOnField < this._itemsCount)
				this.removeOldItems();
			return item;
		}

		genItem() {
			let prototype = this.getPrototypeItem();

			let item = document.createElement('div');
			item.setAttribute('data-type', prototype.className);
			item.classList.add('new');
			item.classList.add('Game__item');
			item.classList.add('Game__item--' + prototype.className);
			if (prototype.addBonus === true)
				item.classList.add('bonus');
			if (prototype.className == 'nybear')
				item.classList.add('Game__item--' + prototype.className + `--` + this.randInt(1, 3));
			if (prototype.className == 'pizza')
				item.classList.add('Game__item--' + prototype.className + `--` + this.randInt(1, 2));
			if (prototype.className == 'balls')
				item.classList.add('Game__item--' + prototype.className + `--` + this.randInt(1, 4));
			if (prototype.className == 'sticker') {
				let id = this.randInt(1, 16);
				item.classList.add('Game__item--' + prototype.className + `--` + id);
				if (this._bonusStickers.includes(id)) // Бонусные стикеры>
					item.classList.add('bonus', `sticker`);
			}
			item.style.top = this.randInt(0, 100) + '%';
			item.style.left = this.randInt(0, 100) + '%';
			item.style.transform = `translate(-50%, -50%) rotate(${this.randInt(0, 359)}deg) scale(${randInt(this._itemMinScale, this._itemMaxScale, 1)})`;

			return item;
		}

		addMoreItems(start = false) {
			for (let index = (start ? this._startItemsCount : (this._randomAddCount ? this.randInt(this._randAddCountMin, this._randAddCountMax) : this._addItemCount)); index > 0; index--) {
				let item = this.genItem();
				setTimeout(() => {
					this._panels.field.append(item);
					setTimeout(() => {
						item.classList.remove(`new`);
					}, 50);
				}, this.randInt(150, 1500));
			}
		}

		clearField() {
			for (const el of this._panels.field.querySelectorAll(`*`))
				el.remove();
		}

		autoAdd() {
			this._intervalIds.autoAdd = setInterval(() => {
				this.addMoreItems();
			}, this._autoAddInterval * 1000);
		}

		autoClearClicked() {
			this._intervalIds.autoClear = setInterval(() => {
				for (const item of this._panels.field.querySelectorAll(`.clicked`))
					item.remove();
			}, 1000);
		}

		setTimerVal() {
			let min = Math.floor(this._currentTime / 60);
			let sec = this._currentTime - (min * 60)
			this._panels.timer.querySelector(`b`).innerText = `${min}:` + (sec < 10 ? '0' + sec : sec);
		}

		timer() {
			this._currentTime = this._gameDuration;
			this.setTimerVal();
			this._intervalIds.timer = setInterval(() => {
				this._currentTime--;
				this.setTimerVal();
				if (this._currentTime == 0)
					this.stop();
				if (test)
					this.consoleProportion();
			}, 1000);
		}

		consoleProportion() {
			let str = [];
			for (const key in this._proportion) {
				str.push(`[${this._proportion[key].count}/${this._generatedItemCount[key]}] ${key} - ${this._proportion[key].rate}`);
			}
			console.log(str.join("\n"));

			console.log(`generatedItemCount	=>	` + this._generatedItemCount.all);
			console.log(`itemsCount	=>	` + this._itemsCount);
		}

		stopIntervals() {
			for (const key in this._intervalIds)
				clearInterval(this._intervalIds[key]);
		}

		clear_Score() {
			this._score = 0;
			this.refresh_Score();
		}

		togglePanel(panel, show = false) {
			if (show) {
				this._panels[panel].classList.remove('hide');
			} else {
				this._panels[panel].classList.add('hide');
			}
		}

		refresh_Score() {
			this._panels.info.querySelector(`b`).innerText = this._score;
		}

		start() {
			this.clearField();
			this.clear_Score();
			this.togglePanel('bttns');
			this.togglePanel('timer', 1);
			this.togglePanel('info', 1);
			this.togglePanel('field', 1);
			this.togglePanel('start');
			this.togglePanel('end');
			this.addMoreItems(true);
			this.timer();
			this.autoAdd();
			this.autoClearClicked();
		}

		stop() {
			this.stopIntervals();
			this.clearField();
			this.togglePanel('bttns', 1);
			this.togglePanel('timer', 0);
			this.togglePanel('info', 0);
			this.togglePanel('field', 0);
			this.togglePanel('start', 0);
			this.togglePanel('bttnSave', 1);
			this.togglePanel('bttnStart', 0);
			this.togglePanel('bttnRestart', 1);
			this.resetStats();

			this.setEndResult();
			this.togglePanel('end', 1);
		}

		setEndResult() {
			this._panels.end.querySelector(`b`).innerText = this._score;
			this._panels.end.querySelector(`input[name='score']`).value = this._score;
		}

		loadElements() {
			this._panels.field = document.querySelector(`.Game__field`);
			this._panels.bttns = document.querySelector(`.Game__bttns`);
			this._panels.info = document.querySelector(`.Game__info`);
			this._panels.timer = document.querySelector(`.Game__timer`);
			this._panels.start = document.querySelector(`.Game__start`);
			this._panels.end = document.querySelector(`.Game__end`);
			this._panels.bttnSave = document.querySelector(`.Game__bttn--save`);
			this._panels.bttnRestart = document.querySelector(`.Game__bttn--restart`);
			this._panels.bttnStart = document.querySelector(`.Game__bttn--start`);
			this._panels.bttnResults = document.querySelector(`.Game__bttn--results`);
			this._panels.form = document.querySelector(`.Game__save`);
			this._panels.results = document.querySelector(`.Game__results`);
			this._panels.results = document.querySelector(`.Game__results`);
			this._panels.tbody = this._panels.results.querySelector('tbody');

		}

		addBonus(item, noBonus = false) {
			item.classList.add(`clicked`);
			if (item.classList.contains(`bonus`) && !noBonus) {
				this._score += (item.classList.contains(`sticker`) ? this._stickerBonusCount : 1);
			}
		}

		async loadResults() {
			let response = await fetch('/result/load/');
			this._results = await response.json();
			this.genResults();
		}

		genTd(text = '') {
			let td = document.createElement('td');
			td.innerText = text;
			return td;
		}

		genTr(id, date, instagram, score) {
			let tr = document.createElement('tr');
			if (Cookie.get('instagram') == instagram)
				tr.classList.add('you');
			tr.setAttribute('data-id', id);
			tr.setAttribute('data-date', date);
			tr.append(this.genTd());
			// tr.append(this.genTd(date));
			tr.append(this.genTd(instagram));
			tr.append(this.genTd(score));
			return tr;
		}

		clearResults() {
			this._panels.tbody.innerHTML = '';
		}

		genResults() {
			this.clearResults();
			for (const res of this._results) {
				this._panels.tbody.append(this.genTr(res.id, res.date, res.instagram, res.score));
			}
		}

		openResults(openEnd = false) {
			if (!openEnd) {
				this.togglePanel('start', 1);
				this.togglePanel('end');
			}
			this.togglePanel('results', 1);
			this.loadResults();
		}

		async saveResult() {
			const fd = new FormData(this._panels.form);
			Cookie.set('score', fd.get(`score`));
			Cookie.set('instagram', fd.get(`instagram`));
			this._panels.form.reset();

			let response = await fetch('/result/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json;charset=utf-8'
				},
				body: JSON.stringify({ save: true })
			});
			let result = await response.json();
			console.log(result);
			if (result) {
				this.openResults();
			} else {
				alert(`Произошла ошибка при сохранении: (`);
			}
			// console.log(result);
		}

		events() {
			this._panels.bttnRestart.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.start();
			});
			this._panels.bttnStart.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.start();
				toggleFullScreen();
			});

			this._panels.field.addEventListener(`click`, (e) => {
				this.addBonus(e.target);
				this.refresh_Score();
			});

			this._panels.form.addEventListener(`submit`, (e) => {
				e.preventDefault();
				this.saveResult();
			});

			this._panels.bttnResults.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.openResults();
			});

			this._panels.results.querySelector(`.Bttn`).addEventListener(`click`, (e) => {
				e.preventDefault();
				this.togglePanel('results');
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
	// animatePoint(12);
});