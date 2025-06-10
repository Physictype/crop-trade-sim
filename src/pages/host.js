import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firestore } from "../firebase.js";
import {
	doc,
	collection,
	getDoc,
	getDocs,
	onSnapshot,
} from "firebase/firestore";

function uto0(x) {
	if (x == null) {
		return 0;
	}
	return x;
}

export async function renderElement(container, args) {
	const htmlElement = html`<div class="pointer-none select-none">
		<div class="flex gap-3">
			<div>Game ID <span id="gameId"></span></div>

			<div><button id="startButton">Start Game!</button></div>
		</div>
		<div class="w-100 items-center justify-center border-2 text-center">
			<h3>Leaderboard</h3>
			<table id="leaderboard" class="table w-full text-center"></table>
		</div>
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
				gameId: args["gameId"],
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		});
	});

	function cropUtilityFunction(num, max) {
		return ((max + max - num + 1) * num) / 2;
	}
	function moneyUtilityFunction(money) {
		return 0;
	}
	let playerElements = {};
	let gameData = (
		await getDoc(doc(firestore, "games", args["gameId"]))
	).data();
	let playersRef = collection(firestore, "games", args["gameId"], "players");
	let leaderboard = document.getElementById("leaderboard");
	(await getDocs(playersRef)).forEach((doc) => {
		let el = document.createElement("tr");
		let nickname = document.createElement("td");
		nickname.innerText = doc.data().nickname;
		let score = document.createElement("td");
		score.innerText = 0;
		el.appendChild(nickname);
		el.appendChild(score);
		playerElements[doc.id] = el;
		leaderboard.appendChild(el);
	});
	onSnapshot(playersRef, (snapshot) => {
		snapshot.docs.forEach((doc) => {
			let playerData = doc.data();
			let score = 0;
			Object.keys(playerData.crops).forEach((crop) => {
				score += cropUtilityFunction(
					playerData.crops[crop],
					gameData.availableCrops[crop].max,
				);
			});
			score += moneyUtilityFunction(playerData.money);
			console.log(doc.id, score);
			playerElements[doc.id].children[1].innerText = score;
		});
		let elementsArray = Object.values(playerElements);
		elementsArray.sort((a, b) => {
			console.log(
				parseInt(a.children[1].innerText),
				"<",
				parseInt(b.children[1].innerText),
			);
			return (
				parseInt(b.children[1].innerText) -
				parseInt(a.children[1].innerText)
			);
		});
		elementsArray.forEach((element) => {
			leaderboard.removeChild(element);
		});
		elementsArray.forEach((element) => {
			leaderboard.appendChild(element);
		});
	});
}
