class RutubeVideo extends HTMLElement {
	constructor() {
		super();
		let uuid = String(URL.createObjectURL(new Blob([])).substr(-36)).split("-").join("");
		/**uuid = uuid.split("").reduce((acc, char) => {
			return ((acc << 5) – acc) + char.charCodeAt(0);
		}, 0);**/
		this.segments = [];
		this.UUID = uuid;
		let str = `
	<style>
		:host{
			font-size: 24px;
			display: block;
			background-color: #14191f;
			color: #fff;
			box-shadow: 0px 0px 1px rgb(255 255 255 / 51%);
			padding: 15px 15px 10px 15px;
			margin-bottom: 15px;
			--box-shadow: 0 0 7px #000000;
			--rutube_image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTIgMTYiIGZpbGw9IiNmZmYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0wIDguNzc1NTJWMTMuOTMwOUgxLjM1MTE5SDIuNzAyMzhWMTIuMTE5NVYxMC4zMDgxTDYuMDU4MTMgMTAuMzE1OUw5Ljc4NzY2IDEwLjMyMzZMOS45MzU0NCAxMC40MTE1QzEwLjExMzMgMTAuNTE3MyAxMC4yMDc1IDEwLjY3NzkgMTAuMjUyMyAxMC45NTE2QzEwLjI3MDQgMTEuMDYxNSAxMC4yODM1IDExLjcyOSAxMC4yODM3IDEyLjUzNjJMMTAuMjgzOSAxMy45MzA5SDExLjYzNTFIMTIuOTg2M0wxMi45ODU5IDEyLjEyNzNDMTIuOTg1NSAxMC4xOTQ2IDEyLjk4NTggMTAuMTk3OSAxMi44Mjc2IDkuODY1NkMxMi43MjcgOS42NTQxOSAxMi40NTIyIDkuMzc1MSAxMi4yMzYgOS4yNjQ4M0MxMi4xMzkzIDkuMjE1NDcgMTEuOTQ1NyA5LjE1MTYyIDExLjgwNTkgOS4xMjI5MUwxMS41NTE2IDkuMDcwNzFMMTEuNzA4NyA5LjAxOTMzQzEyLjA5MjcgOC44OTM3NiAxMi41MjA5IDguNTA3ODIgMTIuNzUwMSA4LjA4MDc1QzEzLjA4NDkgNy40NTY3IDEzLjE2MzQgNi40NDY2MiAxMi45NDA4IDUuNjI0NzFDMTIuNjY0OSA0LjYwNTk1IDExLjk1NDMgMy45NzY4NSAxMC43OTQzIDMuNzI0NEMxMC4zNzkzIDMuNjM0MDggOS41ODEwMyAzLjYyMDY3IDQuNTk4MjcgMy42MjA0MUwwIDMuNjIwMTJWOC43NzU1MlpNMTQuNjk1MyA3LjMzNjk3QzE0LjcwODEgMTEuNDMxOSAxNC42OTg4IDExLjIyNzggMTQuODk5NSAxMS44MDQzQzE1LjI3IDEyLjg2OCAxNi4wODI2IDEzLjU0OTcgMTcuMjgyNyAxMy44MDMzQzE3Ljg1ODIgMTMuOTI0OSAxNy42MTA1IDEzLjkyOTEgMjAuNzUgMTMuOTI5MUMyMy41MTUyIDEzLjkyOTEgMjMuNjQwOSAxMy45MjUgMjQuMjE3MiAxMy44MDM0QzI0Ljg2NSAxMy42NjY4IDI1LjQ1IDEzLjM2NzkgMjUuODYzIDEyLjk2MjZDMjYuMzczNiAxMi40NjE2IDI2LjU4NCAxMi4wMzY5IDI2Ljc0MzkgMTEuMTg1M0MyNi43ODM2IDEwLjk3MzUgMjYuNzkyNCAxMC4zOTk2IDI2LjgwMzggNy4yNzg1NkwyNi44MTcxIDMuNjIwMTJIMjUuNDQ4OEgyNC4wODA2VjYuOTE4ODVDMjQuMDgwNiAxMC41NDM0IDI0LjA4NDcgMTAuNDU1MyAyMy44OTY4IDEwLjgyNTlDMjMuNzU3NiAxMS4xMDA1IDIzLjQ4NzMgMTEuMzA1IDIzLjA4MTYgMTEuNDQyNUMyMi45NTgxIDExLjQ4NDQgMjIuNjU1NyAxMS40OTA5IDIwLjg1MTYgMTEuNDk5MkMxOC4xNDA1IDExLjUwOTUgMTguNTA0MSAxMS41MDg5IDE4LjEzMjkgMTEuMzMzQzE3LjkxNzYgMTEuMjMxIDE3LjY5OTQgMTEuMDI0NCAxNy41ODg4IDEwLjgxNzhDMTcuNDE4MSAxMC40OTg1IDE3LjQyMDUgMTAuNTUzNyAxNy40MTk5IDYuOTQyNjVMMTcuNDE5NCAzLjYyMDEySDE2LjA1MTVIMTQuNjgzNkwxNC42OTUzIDcuMzM2OTdaTTI4LjE4OTEgNC44MTc2OVY2LjAxNTI2SDMwLjkzN0gzMy42ODQ5VjkuOTczMDlWMTMuOTMwOUgzNS4xMTJIMzYuNTM5MVY5Ljk3MzA5VjYuMDE1MjZIMzkuMjcxOUg0Mi4wMDQ2VjQuODE3NjlWMy42MjAxMkgzNS4wOTY5SDI4LjE4OTFWNC44MTc2OVpNNDMuMzkgNy4yNzg1NkM0My40MDEzIDEwLjM4OTcgNDMuNDEwMiAxMC45NzQxIDQzLjQ0OTYgMTEuMTg1M0M0My42MDM2IDEyLjAxMDggNDMuODIxMSAxMi40NTg4IDQ0LjI5NyAxMi45MzA5QzQ0LjU1OTEgMTMuMTkwOSA0NC44MDcxIDEzLjM2MTMgNDUuMTU2NSAxMy41MjE3QzQ1LjYxNzMgMTMuNzMzMiA0NS44NzMxIDEzLjgwMjggNDYuNTAzIDEzLjg4NzhDNDYuOTcgMTMuOTUwOSA1MS45MDI5IDEzLjk1MTUgNTIuMzk2NyAxMy44ODg2QzUzLjMwNzIgMTMuNzcyNSA1My45NjgzIDEzLjUwNTcgNTQuNDk0OSAxMy4wNDE3QzU0Ljg1NTcgMTIuNzIzNyA1NS4xMTIzIDEyLjMyNjYgNTUuMjk0MiAxMS44MDQzQzU1LjQ5NSAxMS4yMjc4IDU1LjQ4NTYgMTEuNDMxOSA1NS40OTg1IDcuMzM2OTdMNTUuNTEwMSAzLjYyMDEySDU0LjE0MjlINTIuNzc1OEw1Mi43NjY1IDcuMDMwMjhDNTIuNzU3OCAxMC4yMjI0IDUyLjc1MzcgMTAuNDUwMyA1Mi43MDI2IDEwLjU5NDNDNTIuNTc4NSAxMC45NDQxIDUyLjMzODMgMTEuMjEyNiA1Mi4wMjUyIDExLjM1MTVDNTEuNjczMSAxMS41MDc3IDUxLjYzNDkgMTEuNTA5NSA0OS4zNDE0IDExLjUwMDRMNDcuMjUxOCAxMS40OTJMNDcuMDUwOCAxMS40MTY2QzQ2LjU1MDQgMTEuMjI5MSA0Ni4zMjk5IDExLjAwMzQgNDYuMTgzIDEwLjUyODFDNDYuMTMyNiAxMC4zNjUxIDQ2LjEyODMgMTAuMTE3NyA0Ni4xMjA0IDYuOTg2NDdMNDYuMTExOSAzLjYyMDEySDQ0Ljc0NDNINDMuMzc2Nkw0My4zOSA3LjI3ODU2Wk01Ny42NzI0IDguNzc0MThWMTMuOTMwOUg2Mi45ODUxQzY3LjY5NiAxMy45MzA5IDY4LjMzNDggMTMuOTI1NiA2OC42MjQ1IDEzLjg4NDJDNjkuNjE5IDEzLjc0MjEgNzAuMjY2NyAxMy4zODg5IDcwLjcyNDcgMTIuNzM4OEM3MS4xNjQzIDEyLjExNDkgNzEuMzI1MyAxMS4wNTAxIDcxLjEwMzEgMTAuMjM2QzcwLjk4NDIgOS44MDA0NCA3MC42ODE5IDkuMzQ3ODIgNzAuMzU0NCA5LjExNTA4QzcwLjE3OTQgOC45OTA2OCA2OS44OTgyIDguODQ3NjcgNjkuNzE4OCA4Ljc5MTc2TDY5LjYwNDcgOC43NTYxOUw2OS44ODM1IDguNjI1NjVDNzAuNDg0IDguMzQ0NDUgNzAuODg5OCA3Ljc3NDY0IDcxLjAzNTIgNy4wMDgzN0M3MS4wODkgNi43MjQ3OCA3MS4wODA0IDYuMDQ5MTIgNzEuMDE5IDUuNzM4NTFDNzAuODQzOSA0Ljg1MjQ4IDcwLjI0NTcgNC4xNTM5NyA2OS40MjMxIDMuODc0OTFDNjkuMTI3MSAzLjc3NDQ2IDY5LjAwNyAzLjc0MzU2IDY4LjY5NDQgMy42ODczOUM2OC40NjY1IDMuNjQ2NDcgNjcuODA2NiAzLjYzOTY2IDYzLjA1NDMgMy42MjkyM0w1Ny42NzI0IDMuNjE3NDNWOC43NzQxOFpNNzIuOTU0OCA4Ljc3NTUyVjEzLjkzMDlINzkuMTMyNUg4Ni4wNTIyTDg2LjA1NDEgMTIuNzMzNEw4Ni4wNTYgMTEuNTM1OEg4MC40NzA0SDc1LjYyNjhWMTAuNzQ3MVY5Ljk1ODQ5SDgwLjQ2OThIODUuMjYxNlY4Ljc3NTUyVjcuNTkyNTVIODAuNDY5OEg3NS42MjY4VjYuODAzOTFWNi4wMTUyNkg4MC40Njk4SDg2LjA1NDdWNC44MTc2OVYzLjYyMDEySDc5LjEzMzhINzIuOTU0OFY4Ljc3NTUyWk02Ny43MDEzIDUuOTU3NDlDNjguMDQ3MSA2LjAwNTYgNjguMjExNCA2LjExNTQ4IDY4LjMzMzEgNi4zODAyNkM2OC40MzIxIDYuNTk1NTYgNjguNDQzNSA2Ljg2ODU1IDY4LjM2NDEgNy4xMjAzQzY4LjI5MjcgNy4zNDYyOSA2OC4xOTM0IDcuNDY0NSA2Ny45ODQ5IDcuNTcxNzlMNjcuODU5NCA3LjYzNjM3TDY0LjEwMTkgNy42NDQyM0w2MC4zNDQ0IDcuNjUyMDhWNi43ODk4NlY1LjkyNzY0TDYzLjkxOTcgNS45MjgyMkM2Ni4wOTY4IDUuOTI4NTcgNjcuNTc1NyA1Ljk0MDAyIDY3LjcwMTMgNS45NTc0OVpNOS44NjQ2NiA2LjEyNTVDMTAuMjA5IDYuMjg4NTcgMTAuMzM2OSA2LjU2MzExIDEwLjMwNjYgNy4wNzQwM0MxMC4yODE4IDcuNDk0MTggMTAuMDg2MyA3Ljc3Nzc3IDkuNzQ0MTggNy44OTAyOEM5LjY1NTY0IDcuOTE5MzcgOC44Mzc5NCA3LjkyOTI4IDUuOTc5ODIgNy45MzU4NUwyLjcwMjM4IDcuOTQ0MlY2Ljk3OTI4VjYuMDE0MzZMNS45OTU2NCA2LjAyMjFMOS42NjI3NCA2LjAyOTg3TDkuODY0NjYgNi4xMjU1Wk02OC4wODcxIDkuOTY5MDZDNjguMjM3MiAxMC4wNDU5IDY4LjM4ODIgMTAuMTkgNjguNDM4MyAxMC4zMDQzQzY4LjUyMDEgMTAuNDkxIDY4LjU0OTggMTAuNzUyMSA2OC41MTIgMTAuOTUyNUM2OC40NTEzIDExLjI3NDYgNjguMzIxNiAxMS40NDU4IDY4LjA1NjggMTEuNTUzM0M2Ny45MjU0IDExLjYwNjcgNjcuNzc1MyAxMS42MDkxIDY0LjEzMjIgMTEuNjE2N0w2MC4zNDQ0IDExLjYyNDVWMTAuNzYxN1Y5Ljg5ODc2TDY0LjE2MjYgOS45MDY3M0M2Ny44MTk0IDkuOTE0MzMgNjcuOTg1NCA5LjkxNjk4IDY4LjA4NzEgOS45NjkwNloiIGZpbGw9IiNGNkY2RjYiPjwvcGF0aD48ZWxsaXBzZSBjeD0iODkuMzY3NyIgY3k9IjEuODA4NzIiIHJ4PSIxLjg2OTAxIiByeT0iMS44MDg3MiIgZmlsbD0iI0ZGMkQyRCI+PC9lbGxpcHNlPjwvc3ZnPg==");
			--rutube_loader: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAzOCAzOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KCTxkZWZzPgoJCTxsaW5lYXJHcmFkaWVudCB4MT0iOC4wNDIlIiB5MT0iMCUiIHgyPSI2NS42ODIlIiB5Mj0iMjMuODY1JSIgaWQ9ImEiPgoJCQk8c3RvcCBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAiIG9mZnNldD0iMCUiLz4KCQkJPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIuNjMxIiBvZmZzZXQ9IjYzLjE0NiUiLz4KCQkJPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZiIgb2Zmc2V0PSIxMDAlIi8+CgkJPC9saW5lYXJHcmFkaWVudD4KCTwvZGVmcz4KCTxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CgkJPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMSAxKSI+CgkJCTxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOCIgaWQ9Ik92YWwtMiIgc3Ryb2tlPSJ1cmwoI2EpIiBzdHJva2Utd2lkdGg9IjIiPgoJCQkJPGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMTggMTgiIHRvPSIzNjAgMTggMTgiIGR1cj0iMC45cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIC8+CgkJCTwvcGF0aD4KCQkJPGNpcmNsZSBmaWxsPSIjZmZmIiBjeD0iMzYiIGN5PSIxOCIgcj0iMSI+CgkJCQk8YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCAxOCAxOCIgdG89IjM2MCAxOCAxOCIgZHVyPSIwLjlzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgLz4KCQkJPC9jaXJjbGU+CgkJPC9nPgoJPC9nPgo8L3N2Zz4=");
		}
		*,
		*::before,
		*::after {
			box-sizing: border-box;
			user-select: none;
		}
		[class^="icon-"], [class*=" icon-"] {
			font-family: "Rutube-DL" !important;
			speak: never;
			font-style: normal;
			font-weight: normal;
			font-variant: normal;
			text-transform: none;
			line-height: 1;
			-webkit-font-smoothing: antialiased;
		}
		.icon-close:before {
			content: "\\e900";
		}
		.icon-download:before {
			content: "\\e901";
		}
		.icon-github:before {
			content: "\\e902";
		}
		.icon-hack:before {
			content: "\\e903";
		}
		.text-left {
			text-align: left;
		}
		.text-center {
			text-align: center;
		}
		.text-right {
			text-align: right;
		}
		.btn {
			cursor: pointer;
		}
		.btn:disabled {
			cursor: not-allowed;
		}
		.btn-add,
		.btn-close,
		.btn-download {
			background-color: transparent;
			appearance: none;
			border: unset;
			color: #fff;
			text-shadow: -1px -1px 1px rgba(255, 255, 255, 0.3), 1px 1px 1px #000000;
		}
		.btn-add,
		.btn-close,
		.btn-download,
		.btn-add:focus,
		.btn-close:focus,
		.btn-download:focus,
		.btn-add:focus-visible,
		.btn-close:focus-visible,
		.btn-download:focus-visible {
			outline: unset;
		}
		.btn-add:disabled,
		.btn-close:disabled,
		.btn-download:disabled {
			color: #aaa;
		}
		.btn-close {
			position: absolute;
			right: -20px;
			top: -12px;
		}
		.downloader {
			width: 100%;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			position: relative;
		}
		.downloader .loader {
			position: absolute;
			opacity: 1;
			visibility: hidden;
			top: 0px;
			left: 0px;
			width: 100%;
			height: 100%;
			right: 0px;
			bottom: 0px;
			z-index: 10;
		}
		.downloader .loader::before {
			content: "";
			display: block;
			position: absolute;
			right: 0px;
			bottom: 60px;
			width: 35px;
			height: 35px;
			background-image: var(--rutube_loader);
			background-repeat: no-repeat;
			background-position: center;
			background-size: contain;
		}
		.downloader .loader.load {
			visibility: visible;
			opacity: 1;
		}
		.downloader .image {
			padding-right: 15px;
		}
		.downloader .links {
			max-width: calc(100% - 215px);
			width: 100%;
		}
		.downloader .image,
		.downloader .links {
			margin-bottom: 15px;
		}
		.downloader .progress {
			width: 100%;
		}
		.downloader .block_image {
			width: 200px;
			aspect-ratio: 16 / 9;
			background-repeat: no-repeat;
			background-position: center center;
			background-size: contain;
			background-image: var(--rutube_image);
			background-color: #000;
			box-shadow: 0 0 1px 2px #333;
			border-radius: 6px;
			overflow: hidden;
			position: relative;
		}
		.downloader .block_image::after {
			content: attr(data-duration);
			padding: 2px;
			background-color: rgba(0, 0, 0, 0.5);
			position: absolute;
			bottom: 5px;
			right: 5px;
			border-radius: 3px;
			font-size: 12px;
		}
		.downloader .block_input {
			margin-bottom: 15px;
		}
		.downloader .block_input input {
			width: 100%;
			display: block;
			padding: 10px 15px;
			border-radius: 6px;
			border-width: 0;
			text-overflow: ellipsis;
			color: #333333;
			background-color: #ffffff;
		}
		.downloader .block_input input,
		.downloader .block_input input:focus-visible {
			outline: unset;
		}
		.downloader .block_input input:disabled {
			color: #ffffff;
		}
		.downloader .block_text .title {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			margin-bottom: 1em;
		}
		.downloader .block_text .btn:disabled {
			color: #ffffff;
		}
		.downloader .block_progress progress {
			width: 100%;
			display: block;
			height: 20px;
			border-radius: 5px;
			overflow: hidden;
		}
		.downloader .block_progress progress::-webkit-progress-bar {
			background-color: #555;
		}
		.downloader .block_progress progress::-webkit-progress-value {
			background-color: #ffffff;
			border-radius: 6px;
			overflow: hidden;
		}
		.downloader .block_result {
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
		}
		.downloader .block_result a.events {
			pointer-events: none;
		}
	</style>
	<slot></slot>
	<div class="downloader">
		<div class="image">
			<div class="block_image"></div>
		</div>
		<div class="links">
			<div class="block_input">
				<input class="url" type="text" value="">
			</div>
			<div class="block_text text-right">
				<div class="title text-left">&#160;</div>
			</div>
		</div>
		<div class="progress">
			<div class="block_progress">
				<progress class="progress"></progress>
			</div>
			<div class="block_result text-right">&#160;</div>
		</div>
		<div class="loader"></div>
		<button class="btn btn-close icon-close"></button>
	</div>`.replace(/\n|\r|\t/gm, ``);
		this.attachShadow({
			mode: "open"
		}).innerHTML = str;
	}

	_formatTime (value) {
		function autopadding(v){
			return ("0" + v).slice(-2);
		}
		let s = autopadding(Math.floor((value / 1000) % 60));
		let m = autopadding(Math.floor((value / 1000 / 60) % 60));
		let h = autopadding(Math.floor((value / (1000 * 60 * 60)) % 24));
		return (h == "00" ? "" : h + ":") + m + ":" + s;
	}

// https://rutube.ru/video/a038c12f5ac1852e556ee88107746587/

	handleEvent (event) {
		const __self = this;
		let m3u8Parser = require('m3u8-parser'),
			URL = require('node:url'),
			customEvent;
		switch(event.type){
			case "input":
				const regex = /^https?:\/\/rutube\.ru\/video\/(\w+)/;
				let url = __self._url.value,
					m, pls;
				__self._title.title = "";
				__self._title.innerHTML = "\u00A0";
				__self._image.dataset.duration = "";
				if ((m = regex.exec(url)) !== null) {
					__self._loader.classList.add('load');
					__self.setAttribute('load', 'unload');
					// Отправляем событие
					customEvent = new CustomEvent('rutube-video:input', {
						bubbles: true
					});
					__self.dispatchEvent(customEvent);
					pls = `https://rutube.ru/api/play/options/${m[1]}/?no_404=true&referer=https%3A%2F%2Frutube.ru`;
					// Получаем информацию о видео
					fetch(pls).then(res => res.json()).then((json) => {
						__self._image.dataset.duration = __self._formatTime(json.duration);
						__self._title.title = __self._title.innerText = json.title;
						__self._image.setAttribute('style', `--rutube_image: url(${json.thumbnail_url});`)
						// Получаем информацию о плейлисте
						fetch(json["video_balancer"]["m3u8"]).then(res => res.text()).then(text => {
							// Плейлист с m3u8 файлами
							// Выбрать самый последний
							let m3u8Video = new m3u8Parser.Parser();
							m3u8Video.push(text);
							m3u8Video.end();
							let plsm3u8 = m3u8Video.manifest.playlists,
								uri = plsm3u8.pop().uri,
								myURL = URL.parse(uri),
								pathname = myURL.pathname.split("/"),
								urlPrefix;
							pathname.pop();
							urlPrefix = myURL.protocol + "//" + myURL.host + "/" + pathname.join("/") + "/";
							// Получаем информацию на сегменты видео
							fetch(uri).then(res => res.text()).then(segm => {
								let segmentsPlayList = new m3u8Parser.Parser();
								segmentsPlayList.push(segm);
								segmentsPlayList.end();
								// Сегменты получены
								segmentsPlayList.manifest.segments.forEach((a, b, c) => {
									__self.segments[b] = urlPrefix + a.uri
								});
								__self._loader.classList.remove('load');
								if(__self.segments.length) {
									//
									// console.log(__self.segments);
									__self.setAttribute('load', 'load');
									customEvent = new CustomEvent('rutube-video:input', {
										bubbles: true
									});
									__self.dispatchEvent(customEvent);
								}
							}).catch((err) => {
								__self.setAttribute('load', 'unload');
								__self._image.removeAttribute('style');
								__self._loader.classList.remove('load');
								__self.segments = [];
								customEvent = new CustomEvent('rutube-video:input', {
									bubbles: true
								});
								__self.dispatchEvent(customEvent);
								console.log(err);
							});
						}).catch((err) => {
							__self.setAttribute('load', 'unload');
							__self._image.removeAttribute('style');
							__self._loader.classList.remove('load');
							__self.segments = [];
							customEvent = new CustomEvent('rutube-video:input', {
								bubbles: true
							});
							__self.dispatchEvent(customEvent);
							console.log(err);
						});
					}).catch((err) => {
						__self.setAttribute('load', 'unload');
						__self._image.removeAttribute('style');
						__self._loader.classList.remove('load');
						__self.segments = [];
						customEvent = new CustomEvent('rutube-video:input', {
							bubbles: true
						});
						__self.dispatchEvent(customEvent);
						console.log(err);
					});
				}else{
					__self.setAttribute('load', 'unload');
					__self._image.removeAttribute('style');
					__self._loader.classList.remove('load');
					__self.segments = [];
					customEvent = new CustomEvent('rutube-video:input', {
						bubbles: true
					});
					__self.dispatchEvent(customEvent);
				}
				break;
			case 'click':
				// Отправляем событие на удаление
				customEvent = new CustomEvent('rutube-video:close', {
					bubbles: true
				});
				__self.dispatchEvent(customEvent);
				break;
		}
	}

	connectedCallback() {
		console.log("Ready to go 😎");
		this.setAttribute('load', 'unload');
		this._image = this.shadowRoot.querySelector('.block_image');
		this._url = this.shadowRoot.querySelector('.url');
		this._title = this.shadowRoot.querySelector('.title');
		this._progress = this.shadowRoot.querySelector('.progress');
		this._result = this.shadowRoot.querySelector('.block_result');
		this._loader = this.shadowRoot.querySelector('.loader');
		this._close = this.shadowRoot.querySelector('.btn-close');
		this._url.addEventListener('input', this);
		this._close.addEventListener('click', this);
	}

	disconnectedCallback() {
		this._url.removeEventListener('input', this);
		this._close.removeEventListener('click', this);
		console.log("All clean 😊");
	}
}

