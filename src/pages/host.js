import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firestore } from "../firebase.js";
import { doc, collection, getDoc, onSnapshot } from "firebase/firestore";

function uto0(x) {
	if (x == null) {
		return 0;
	}
	return x;
}

export async function renderElement(container, args) {
	const htmlElement = html`<div class="pointer-none select-none">
		<div>Game ID <span id="gameId"></span></div>
		<button id="startButton">Start Game!</button>
	</div>`;
	window.addEventListener("contextmenu", function (e) {
		e.preventDefault();
	});
	render(htmlElement, container);
	document.getElementById("gameId").innerText = args["gameId"];
	document.getElementById("startButton").addEventListener("click", (e) => {
		fetch("http://localhost:3000/startGame", {
			method: "POST",
			credentials: "include",
			body: JSON.stringify({
				userId: "1",
				gameId: args["gameId"],
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		});
	});
}
