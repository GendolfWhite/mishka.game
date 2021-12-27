export function isWebp() {
	function testWebP(callback) {
		var webP = new Image();
		webP.onload = webP.onerror = function () {
			callback(webP.height == 2);
		};
		webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
	}

	testWebP(function (support) {
		if (support == true) {
			document.querySelector('body').classList.add('webp');
		} else {
			document.querySelector('body').classList.add('no-webp');
		}
	});
}

export function ServiceWorker() {
	if ("serviceWorker" in navigator) {
		self.addEventListener("load", async () => {
			const container = navigator.serviceWorker;
			if (container.controller === null) {
				const reg = await container.register("./js/sw.js");
			}
		});
	}
}

export const Cookie = {
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