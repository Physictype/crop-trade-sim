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
		<form>
			<label>Game ID</label>
			<input type="text" id="gameId" />
			<br />
			<button id="joinButton">Join Game</button>
		</form>
	</div>`;
	window.addEventListener("contextmenu", function (e) {
		e.preventDefault();
	});
	render(htmlElement, container);
	document.getElementById("joinButton").addEventListener("click", (e) => {
		e.preventDefault();
		fetch("http://localhost:3000/joinGame", {
			method: "POST",
			credentials: "include",
			body: JSON.stringify({
				userId: "3",
				gameId: document.getElementById("gameId").value,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((value) => {
				if (value.ok) {
					window.location.pathname =
						"/game/" + document.getElementById("gameId").value;
				} else {
				}
			})
			.catch((error) => {
				console.log("what");
				console.log("error:", error);
			});
	});
}
