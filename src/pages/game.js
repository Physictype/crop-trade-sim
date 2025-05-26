import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firestore } from "../firebase.js";
import { doc, collection, getDoc, onSnapshot } from "firebase/firestore";

export async function renderElement(container, args) {
	const htmlElement = html`<div>
		Game ID <span id="gameId"></span>
		<div class="flex gap-4">
			<div
				class="grid size-100 grid-cols-5 grid-rows-5 border-2 bg-amber-100 [&>*]:h-full [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
				id="plot"
			></div>
			<div
				class="grid-rows-auto grid h-150 w-30 grid-cols-2 grid-rows-10 gap-2 [&>*]:h-full [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
				id="seeds"
			></div>
		</div>
		<div
			class="pointer-events-none absolute h-15 w-20 bg-amber-300"
			id="tooltip"
		></div>
	</div>`;
	render(htmlElement, container);
	let plot = document.getElementById("plot");
	var gameDoc = doc(firestore, "games", args["gameId"]);
	var cropsList = (await getDoc(gameDoc)).data().cropsList;

	let tooltip = { element: document.getElementById("tooltip"), numHover: 0 };

	for (let i = 0; i < 25; i++) {
		let cell = document.createElement("div");
		cell.innerText = "";
		cell.addEventListener("click", function () {
			fetch("http://localhost:3000/plantSeed", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					userId: "1",
					gameId: "28291038",
					seed: "wheat",
					idx: i,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				},
			});

			cell.style.backgroundImage = "url('/crops/" + "wheat" + ".png')";
		});
		cell.addEventListener("mouseenter", function () {
			tooltip.numHover += 1;
			tooltip.element.style.opacity = 1;
		});
		cell.addEventListener("mouseleave", function () {
			tooltip.numHover -= 1;
			if (tooltip.numHover == 0) {
				tooltip.element.style.opacity = 0;
			}
		});
		cell.addEventListener("mousemove", function (e) {
			tooltip.element.style.left = e.clientX + "px";
			tooltip.element.style.top = e.clientY + "px";
			tooltip.element.innerText = cell.style.backgroundImage;
		});
		plot.appendChild(cell);
	}
	document.getElementById("gameId").innerText = args["gameId"];
	var seedButtons = {};
	cropsList.forEach((crop) => {
		console.log(crop);
		let buyElement = html`<div class="relative">
			<p
				class="absolute right-0 bottom-0 bg-[url('/crops/${crop.name}.png')] text-sm"
			>
				0
			</p>
		</div>`;
		render(buyElement, document.getElementById("seeds"));
		seedButtons[crop.name] =
			document.getElementById("seeds").children[
				document.getElementById("seeds").children.length - 1
			];
	});
	onSnapshot(gameDoc, (docSnap) => {
		if (docSnap.exists()) {
			console.log("Document data:", docSnap.data());
		} else {
			console.log("No such document!");
		}
	});

	const playerRef = doc(
		firestore,
		"games",
		args["gameId"],
		"players",
		args["playerId"],
	);
	var playerData = (await getDoc(playerRef)).data();
	console.log(playerData);
	Object.keys(playerData.plot).forEach((key) => {
		if (key < 0 || key >= plot.children.length) {
			return;
		}
		plot.children[key].style.backgroundImage =
			"url('/crops/" + playerData.plot[key].type + ".png')";
	});
	Object.keys(playerData.crops).forEach((key) => {
		seedButtons[key].children[0].innerText = playerData.crops[key];
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
	const img = new Image();
	img.src = "/crops/wheat.png";
	img.onload = () => console.log("Image loaded!");
	img.onerror = () => console.error("Image failed to load");
}
