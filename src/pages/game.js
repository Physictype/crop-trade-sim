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
	const htmlElement = html`<div>
		Game ID <span id="gameId"></span>
		<div class="flex gap-4">
			<div
				class="grid size-100 grid-cols-5 grid-rows-5 border-2 bg-amber-100 [&>*]:h-full [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
				id="plot"
			></div>
			<div class="border-4 p-2">
				<h3 class="text-center">Seeds</h3>
				<div
					class="grid-rows-auto grid h-90 w-30 grid-cols-2 grid-rows-6 gap-2 [&>*]:relative [&>*]:h-full [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
					id="seeds"
				></div>
			</div>
		</div>
		<div
			class="pointer-events-none absolute m-1 h-37 w-50 bg-amber-300 p-2 opacity-0"
			id="tooltip"
		></div>
		<button id="test">test</button>
	</div>`;
	render(htmlElement, container);
	document.getElementById("test").addEventListener("click", (e) => {
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
	let plot = document.getElementById("plot");
	var gameDoc = doc(firestore, "games", args["gameId"]);
	const playerRef = doc(
		firestore,
		"games",
		args["gameId"],
		"players",
		args["playerId"],
	);
	var [gameDocSnapshot, playerSnapshot] = await Promise.all([
		getDoc(gameDoc),
		getDoc(playerRef),
	]);
	var cropsList = gameDocSnapshot.data().cropsList;
	console.log(cropsList);

	var playerData = playerSnapshot.data();

	var seedButtons = {};
	let selectedSeed = "";
	Object.keys(cropsList).forEach((crop) => {
		let container = document.createElement("div");
		container.style.backgroundImage = `url('/crops/${crop}.png')`;
		let content = html`<p class="absolute right-1 bottom-0 text-sm">0</p>`;
		document.getElementById("seeds").appendChild(container);
		render(content, container);
		container.addEventListener("click", (e) => {
			if (selectedSeed != "") {
				seedButtons[selectedSeed].style.borderWidth = "1px";
			}
			if (selectedSeed == crop) {
				selectedSeed = "";
			} else {
				selectedSeed = crop;
				seedButtons[selectedSeed].style.borderWidth = "3px";
			}
		});
		seedButtons[crop] = container;
	});

	playerData = {
		_crops: playerData.crops,
		get crops() {
			return this._crops;
		},
		set crops(val) {
			this._crops = val;
		},
		seeds: new Proxy(playerData.seeds, {
			set(target, prop, value) {
				seedButtons[prop].children[0].innerText = value;
				target[prop] = value;
				return true;
			},
		}),
		plot: new Proxy(playerData.plot, {
			set(target, prop, value) {
				plot.children[prop].style.backgroundImage =
					"url('/crops/" + value.type + ".png')";
				target[prop] = value;
				return true;
			},
		}),
	};

	let tooltip = { element: document.getElementById("tooltip"), numHover: 0 };

	for (let i = 0; i < 25; i++) {
		let cell = document.createElement("div");
		cell.innerText = "";
		cell.addEventListener("click", function () {
			if (playerData.seeds[selectedSeed] > 0) {
				fetch("http://localhost:3000/plantSeed", {
					method: "POST",
					credentials: "include",
					body: JSON.stringify({
						userId: "1",
						gameId: args["gameId"],
						seed: selectedSeed,
						idx: i,
					}),
					headers: {
						"Content-type": "application/json; charset=UTF-8",
					},
				});
				playerData.plot[i] = { type: selectedSeed, stage: 0 };
				playerData.seeds[selectedSeed]--;
			}
		});
		let hovering = false;
		cell.addEventListener("mouseenter", function () {
			if (playerData.plot[i]?.type > "") {
				tooltip.numHover += 1;
				tooltip.element.style.opacity = 1;
				hovering = true;
			}
		});
		cell.addEventListener("mouseleave", function () {
			if (playerData.plot[i]?.type > "" && hovering) {
				tooltip.numHover -= 1;
				if (tooltip.numHover == 0) {
					tooltip.element.style.opacity = 0;
				}
				hovering = false;
			}
		});
		cell.addEventListener("mousemove", function (e) {
			tooltip.element.style.left = e.clientX + "px";
			tooltip.element.style.top = e.clientY + "px";
			tooltip.element.innerText =
				playerData.plot[i]?.type +
				", stage " +
				playerData.plot[i]?.stage;
		});
		plot.appendChild(cell);
	}
	document.getElementById("gameId").innerText = args["gameId"];
	onSnapshot(gameDoc, (docSnap) => {
		if (docSnap.exists()) {
			console.log("Document data:", docSnap.data());
		} else {
			console.log("No such document!");
		}
	});
	console.log(playerData);
	Object.keys(playerData.plot).forEach((key) => {
		if (key < 0 || key >= plot.children.length) {
			return;
		}
		plot.children[key].style.backgroundImage =
			"url('/crops/" + playerData.plot[key].type + ".png')";
	});
	Object.keys(playerData.crops).forEach((key) => {
		seedButtons[key].children[0].innerText = uto0(playerData.seeds[key]);
	});

	console.log(playerData.crops);
	Object.keys(playerData.crops).forEach((key) => {
		console.log(playerData.crops[key]);
	});

	// REMOVE!!! replace with client logic.
	// onSnapshot(playerRef, (docSnap) => {
	// 	if (docSnap.exists()) {
	// 		console.log("Document data:", docSnap.data());
	// 		let data = docSnap.data();
	// 		Object.keys(data.plot).forEach((key) => {
	// 			if (key < 0 || key >= plot.children.length) {
	// 				return;
	// 			}
	// 			plot.children[key].style.backgroundImage =
	// 				"url('/crops/" + data.plot[key].type + ".png')";
	// 		});
	// 		// for (let i = 0; i < data.plot.length; i++) {
	// 		// 	plot.children[i].style.backgroundImage =
	// 		// 		"url('/crops/" + data.plot[i].type + ".png')";
	// 		// }
	// 		console.log(data.crops);
	// 		Object.keys(data.crops).forEach((key) => {
	// 			console.log(data.crops[key]);
	// 		});
	// 	} else {
	// 		console.log("No such document!");
	// 	}
	// });
}
