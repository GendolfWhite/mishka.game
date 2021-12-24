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

	class GameStatsTable {
		#aT = null;
		#data = {};
		constructor(show = true, data = {}) {
			this.#create();
			this.hide();
			if (show) {
				this.#setData(data);
				this.#generateTable();
			}
		}

		#create() {
			this.#aT = document.createElement('table');
			this.#aT.classList.add('Stats');
			this.#aT.setAttribute(`id`, `adminTable`);
			// let div = document.createElement('div');
			this.#aT.innerHTML = `<thead><tr><th>#</th><th>name</th><th>gen</th><th>count</th><th>proportion</th></tr></thead><tbody></tbody><tfoot></tfoot>`;
			document.querySelector(`[data-game-panel='results']`).after(this.#aT);
			// document.querySelector(`body`).append(div);
			// this.#aT = document.querySelector(`#adminTable`);
			// this.#aT.style.display = `none`;
		}

		#setData(data) {
			this.#data = data;
		}

		#generateTable() {
			for (const type in this.#data.typeProportion)
				this.#aT.querySelector(`tbody`).append(this.#adminTr(type, type));
			this.#aT.querySelector(`tfoot`).append(this.#adminTr(`itemCount`, `itemCount`, false));
			this.#aT.querySelector(`tfoot`).append(this.#adminTr(`itemGennerate`, `itemGennerate`, false));
		}

		#adminTd(val = false, id = false, colspan = false) {
			let td = document.createElement(`td`);
			if (val)
				td.innerText = val;
			if (id)
				td.setAttribute(`id`, id);
			if (colspan)
				td.setAttribute(`colspan`, colspan);
			return td;
		}

		#adminTr(name, id, body = true) {
			let tr = document.createElement(`tr`);
			tr.append(this.#adminTd());
			tr.append(this.#adminTd(name, false, (body ? false : 2)));
			if (body) {
				tr.append(this.#adminTd(false, id + `_gen`));
				tr.append(this.#adminTd(false, id + `_count`));
				tr.append(this.#adminTd(false, id + `_proportion`));
			} else {
				tr.append(this.#adminTd(false, id, (body ? false : 2)));
			}
			return tr;
		}

		#adminTableVal(id, val) {
			this.#aT.querySelector(`#${id}`).innerText = val;
		}

		draw(data) {
			if (!test) {
				this.hide();
				return;
			};
			this.#setData(data);
			this.show();
			this.#adminTableVal(`itemCount`, this.#data.itemCount);
			this.#adminTableVal(`itemGennerate`, this.#data.itemGennerate);
			for (const type in this.#data.typeProportion) {
				this.#adminTableVal(`${type}_gen`, this.#data.typeCount[type].gennerate);
				this.#adminTableVal(`${type}_count`, this.#data.typeCount[type].current);
				this.#adminTableVal(`${type}_proportion`, this.#data.typeProportion[type]);
			}
		}
		hide() {
			this.#aT.hidden = 1;
		}
		show() {
			this.#aT.hidden = 0;
		}
	}

	class GameStats {
		#currentType = null;
		#types = [];
		#itemGennerate = 0;
		#itemCount = 0;
		#typeProportion = {};
		#typeCount = {};
		constructor(types) {
			this.#types = types;
			this.#createTypeStats();

			this.table = new GameStatsTable(1, this.#getStatDate());
		}

		#getStatDate() {
			return { itemGennerate: this.#itemGennerate, itemCount: this.#itemCount, typeProportion: this.#typeProportion, typeCount: this.#typeCount }
		}

		#setCurrentType(type) {
			this.#currentType = type;
		}

		#createTypeStats() {
			for (const type of this.#types) {
				this.#typeProportion[type] = 0;
				this.#typeCount[type] = {
					gennerate: 0,
					current: 0,
				};
			}
		}

		#calcProportion(all, current) {
			return (current * 100 / all).toFixed(2);
		}

		typeProportion(type) {
			return this.#calcProportion(this.#itemGennerate, this.#typeCount[type].gennerate + 1);
		}

		getItemCount() {
			return this.#itemCount;
		}

		#calcAllCount() {
			this.#itemCount = 0;
			for (const type in this.#typeCount) {
				this.#itemCount += this.#typeCount[type].current;
			}
		}

		#setProportion(proportion) {
			this.#typeProportion[this.#currentType] = proportion;
		}

		#setCount(count = false) {
			this.#typeCount[this.#currentType].current = (count ? count : this.#typeCount[this.#currentType].current + 1);
			this.#setProportion(this.#calcProportion(this.#itemGennerate, this.#typeCount[this.#currentType].gennerate));
			if (count) {
				this.#calcAllCount();
			} else {
				this.#itemCount++;
			}
		}

		setCount(type, count) {
			this.#setCurrentType(type);
			this.#setCount(count);
		}

		#addGennerate() {
			this.#typeCount[this.#currentType].gennerate++;
			this.#itemGennerate++;
		}

		addStat(type) {
			this.#setCurrentType(type);
			this.#setCount(false);
			this.#addGennerate();
			this.table.draw(this.#getStatDate());
		}

		clearStats(global = false) {
			if (global)
				this.#itemGennerate = 0;
			this.#itemCount = 0;
			this.#typeProportion = {};
			this.#typeCount = {};
			this.#createTypeStats();
			this.table.hide();
		}
	}

	class GameItem {
		#item = null;
		#itemStyles = [];
		#prototype = null;
		#itemType = null;
		#itemMinScale = 1.5;
		#itemMaxScale = 2.5;
		#bonusStickers = [4, 11, 13];
		#itemTypes = [];
		#items = {
			cocktail: { name: "Виски-кола", specimen: null, className: 'cocktail', addBonus: true },
			shot: { name: "Лимончело", specimen: null, className: 'shot', addBonus: true },
			nybear: { name: "Медведь в новогодней шапке", specimen: null, className: 'nybear', addBonus: true, count: 3 },
			balls: { name: "Ёлочные шары", specimen: null, className: 'balls', addBonus: true, count: 4 },
			tree: { name: "Ёлка", specimen: null, className: 'tree', addBonus: true },
			pizza: { name: "Пицца", specimen: null, className: 'pizza', addBonus: true, count: 2 },
			sticker: { name: "Стикеры из телеги", specimen: null, className: 'sticker', addBonus: false, count: 16 },
		};

		constructor() {
			this.#createItemLibrary();
		}

		#addTypeToList(type) {
			this.#itemTypes.push(type);
		}

		#createItemLibrary() {
			for (const type in this.#items) {
				this.#setPrototype(this.#items[type]);
				this.#addTypeToList(type);
				this.#newItem();
				this.#setItemType();
				this.#items[type].specimen = this.#getItem();

				if (this.#items[type].count !== undefined) {
					this.#items[type].specimen = this.#getItemStyles();
				}
			}
		}

		#clearItemStyles() {
			this.#itemStyles = [];
		}

		#addItemStyle(item) {
			this.#itemStyles.push(item);
		}

		#createItemStyles() {
			for (let index = 1; index <= this.#prototype.count; index++) {
				this.#setItem(this.#prototype.specimen.cloneNode());
				this.#setItemStyle(index);
				this.#addItemStyle(this.#getItem());
			}
		}

		#getItemStyles() {
			this.#clearItemStyles();
			this.#createItemStyles();
			return this.#itemStyles;
		}

		#newItem() {
			this.#item = document.createElement('div');
		}

		#setItem(item) {
			this.#item = item;
		}

		#setPrototype(prototype) {
			this.#prototype = prototype;
		}

		#setItemStyle(index) {
			this.#item.classList.add(`GameItem--` + this.#prototype.className + `--` + index);
			if (this.#prototype.className == 'sticker') {
				if (this.#bonusStickers.includes(index)) // Бонусные стикеры>
					this.#item.classList.add('bonus', `sticker`);
			}
		}

		#setItemType() {
			this.#item.setAttribute('data-type', this.#prototype.className);
			this.#item.classList.add('GameItem');
			this.#item.classList.add('GameItem--' + this.#prototype.className);

			if (this.#prototype.addBonus === true)
				this.#item.classList.add('bonus');

			this.#item.classList.add('new');
		}

		#getItem() {
			return this.#item;
		}

		#randInt(min, max, float = false) {
			return (float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min) + min));
		}

		#setItemPosition() {
			this.#item.style.top = this.#randInt(0, 100) + '%';
			this.#item.style.left = this.#randInt(0, 100) + '%';
		}

		#setItemTransform() {
			this.#item.style.transform = `translate(-50%, -50%) rotate(${this.#randInt(0, 359)}deg) scale(${this.#randInt(this.#itemMinScale, this.#itemMaxScale, 1)})`;
		}

		#setItemCoordinate() {
			this.#setItemPosition();
			this.#setItemTransform();
		}

		#setNewItemType(type) {
			this.#itemType = (type ? type : this.getRandType());
		}

		#getRandStyle() {
			return this.#items[this.#itemType].specimen[this.#randInt(0, this.#items[this.#itemType].specimen.length - 1)];
		}

		#selectItem() {
			this.#setItem((Array.isArray(this.#items[this.#itemType].specimen) ? this.#getRandStyle() : this.#items[this.#itemType].specimen).cloneNode(true));
		}

		getTypes() {
			return this.#itemTypes;
		}

		getRandType() {
			return this.#itemTypes[this.#randInt(0, this.#itemTypes.length)];
		}

		getItem(type = false) {
			this.#setNewItemType(type);
			this.#selectItem();
			this.#setItemCoordinate();
			return this.#getItem();
		}
	}

	class GameResult {
		#results = null;
		#form = null;
		#table = null;
		constructor(table, form) {
			this.#table = table;
			this.#form = form;
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

		load() {
			this.#loadResults();
		}

		async save() {
			const fd = new FormData(this.#form);
			Cookie.set('score', fd.get(`score`));
			Cookie.set('instagram', fd.get(`instagram`));
			this.#form.reset();

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
				// this.#openResults();
				this.#loadResults();
			} else {
				alert(`Произошла ошибка при сохранении: (`);
			}
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
			this.#table.innerHTML = '';
		}

		#genResults() {
			this.#clearResults();
			for (const res of this.#results) {
				this.#table.append(this.#genTr(res.id, res.date, res.instagram, res.score));
			}
		}
	}

	class Game {
		status = 'stop';
		#item = null;
		#stats = null;
		#result = null;
		#panels = {};
		#intervalIds = {
			autoAdd: null,
			autoClear: null,
			timer: null,
			autoClick: null,
		};

		#addItemCount = 10; // кол-во итемов для добавления в тик по умолчанию
		#randomAddCount = true; // Включить геннерацию рандомного числла для добавления новы итемов в тик.
		#randAddCountMin = 5;
		#randAddCountMax = 15;
		#autoAddInterval = 1; // sec
		#startItemsCount = 15;
		#maxItemCountOnField = 300;

		#stickerBonusCount = 2;

		#gameDuration = 60; // сек
		#currentTime = 0;
		#score = 0;

		#proportion = {
			cocktail: 15,
			shot: 15,
			nybear: 15,
			balls: 15,
			tree: 15,
			pizza: 15,
			sticker: 50,
		};

		constructor(gameDuration = false) {
			if (gameDuration)
				this.#gameDuration = gameDuration;
			this.#loadPanels();
			this.#events();

			this.#item = new GameItem;
			this.#stats = new GameStats(this.#item.getTypes());
			this.#result = new GameResult(this.#panels.tbody, this.#panels.form);
		}

		#loadPanels() {
			for (const el of document.querySelectorAll(`[data-game-panel]`)) {
				this.#panels[el.getAttribute(`data-game-panel`)] = el;
			}
		}

		start() {
			this.#clearField();
			this.#clearScore();
			this.#togglePanels({
				'bttns': 0,
				'timer': 1,
				'info': 1,
				'field': 1,
				'start': 0,
				'end': 0,
			});
			this.#addMoreItems(true);
			this.#timer();
			this.#autoAdd();
			this.#autoClearClicked();
			if (test) {
				// this.#autoClick();
			}

			this.status = 'play';
		}

		stop() {
			this.#stopIntervals();
			this.#clearField();
			this.#togglePanels({
				'bttns': 1,
				'timer': 0,
				'info': 0,
				'field': 0,
				'start': 0,
				'bttnSave': 1,
				'bttnStart': 0,
				'bttnRestart': 1,
			});
			this.#stats.clearStats(1);
			this.#setGameResult();
			this.#togglePanels({ 'end': 1 });
			this.status = 'stop';
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
				this.#result.save();
				this.#openResults();
			});

			this.#panels.bttnResults.addEventListener(`click`, (e) => {
				e.preventDefault();
				this.#openResults();
			});

			this.#panels.results.querySelector(`.Bttn`).addEventListener(`click`, (e) => {
				e.preventDefault();
				this.#togglePanels({ 'results': 0 });
			});

			window.addEventListener(`keypress`, (e) => {
				console.log(e.keyCode);
				if (e.keyCode == 116)
					test = !test;
				if (e.keyCode == 99)
					console.log(Cookie.list());
				if (e.keyCode == 115) {
					if (this.status == 'play')
						this.stop();
					else
						this.start();
				}
			});
		}

		#randInt(min, max, float = false) {
			return (float ? Math.random() * (max - min) + min : Math.floor(Math.random() * (max - min) + min));
		}

		#checkTypeProportion(type, newProportion) {
			if (newProportion >= this.#proportion[type]) {
				return true;
			} else {
				return false;
			}
		}

		#getTypeItem() {
			let type = false;
			if (this.#startItemsCount > this.#stats.getItemCount()) {
				type = this.#item.getRandType();
			} else {
				while (type === false) {
					type = this.#item.getRandType();
					let prop = this.#stats.typeProportion(type);
					if (this.#checkTypeProportion(type, prop)) {
						type = false;
					}
				}
			}
			this.#stats.addStat(type);
			return type;
		}

		#genItem() {
			if (this.#maxItemCountOnField < this.#stats.getItemCount())
				this.#removeOldItems();
			return this.#item.getItem(this.#getTypeItem());
		}

		#updateStats() {
			for (const type of this.#item.getTypes()) {
				this.#stats.setCount(type, this.#panels.field.querySelectorAll(`[data-type='${type}']:not(.old)`).length);
			}
		}

		#removeOldItems() {
			let i = this.#maxItemCountOnField / 2;
			for (const item of this.#panels.field.querySelectorAll(`*`)) {
				if (i > 0) {
					item.classList.add('old');
					this.#addBonus(item, true);
				}
				i--;
			}
			this.#updateStats();
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
			}, 1000);
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
				this.#panels[panels].classList.remove('hide');
			} else {
				this.#panels[panels].classList.add('hide');
			}
		}

		#togglePanels(panels = {}) {
			// eval(`this.#panels[panel].classList.` + (show ? `remove` : `add`) + `('hide');`);
			for (const name in panels) {
				if (panels[name]) {
					this.#panels[name].classList.remove('hide');
				} else {
					this.#panels[name].classList.add('hide');
				}
			}
		}

		#refreshScore() {
			this.#panels.info.querySelector(`b`).innerText = this.#score;
		}

		#autoClick() {
			this.#intervalIds.autoClick = setInterval(() => {
				for (const el of this.#panels.field.querySelectorAll(`*`)) {
					el.click();
				}
			}, 500);
		}

		#setGameResult() {
			this.#panels.end.querySelector(`b`).innerText = this.#score;
			this.#panels.end.querySelector(`input[name='score']`).value = this.#score;
			if (Cookie.get('instagram') != undefined)
				this.#panels.end.querySelector(`input[name='instagram']`).value = Cookie.get('instagram');
		}

		#addBonus(item, noBonus = false) {
			item.classList.add(`clicked`);
			if (item.classList.contains(`bonus`) && !noBonus) {
				this.#score += (item.classList.contains(`sticker`) ? this.#stickerBonusCount : 1);
			}
		}

		#openResults(openEnd = false) {
			this.#result.load();
			if (!openEnd) {
				this.#togglePanels({ 'start': 1, 'end': 0 });
			}
			this.#togglePanels({ 'results': 1 });
		}

	}

	new Game(90);

});