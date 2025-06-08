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
		<div class="flex w-full">
			<div class="flex-1/2">
				<div>Game ID <span id="gameId"></span></div>
				<div>Money: <span id="money"></span></div>
			</div>
			<div class="flex-1/2 text-right text-6xl" id="timer">0:00</div>
		</div>
		<br />
		<div class="flex gap-1">
			<div
				class="grid size-120 grid-cols-5 grid-rows-5 border-2 bg-amber-100 [&>*]:h-full [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
				id="plot"
			></div>
			<div class="flex flex-col gap-1">
				<div class="border-4 p-2">
					<h3 class="box-heading w-90 text-center">Seeds</h3>
					<div>
						<div
							class="grid-rows-auto grid w-90 grid-cols-6 gap-2 [&>*]:relative [&>*]:h-[53.33px] [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
							id="seeds"
						></div>
						<button
							class="overlay-button"
							data-pointer="marketOverlay"
						>
							Open Marketplace
						</button>
					</div>
				</div>
				<div class="border-4 p-2">
					<h3 class="box-heading w-90 text-center">Crops</h3>
					<div
						class="grid-rows-auto grid w-90 grid-cols-6 gap-2 [&>*]:relative [&>*]:h-[53.33px] [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
						id="crops"
					></div>
				</div>
			</div>
			<div class="flex w-90 flex-col items-center gap-1">
				<div class="w-full border-4 p-2">
					<h3 class="box-heading w-full text-center">Offers</h3>
					<form
						class="w-full [&>*]:flex [&>*]:items-center"
						id="offers"
					></form>
				</div>
				<div class="w-full border-4 p-2">
					<h3 class="box-heading w-full text-center">Trading</h3>
					<div>
						<button
							class="overlay-button"
							data-pointer="tradeOverlay"
						>
							Open Trading Stands
						</button>
						<form
							class="w-full [&>*]:flex [&>*]:items-center"
							id="trades"
						>
							<select />
						</form>
					</div>
				</div>
			</div>
		</div>
		<div
			class="pointer-events-none absolute m-1 h-37 w-50 bg-amber-300 p-2 opacity-0"
			id="tooltip"
		></div>
		<button id="test">test</button>
		<div
			class="fixed inset-0 z-50 flex hidden h-full w-full items-center justify-center bg-black/20"
			id="tradeOverlay"
		>
			<div
				class="h-[90%] w-[90%] rounded-2xl bg-white p-6 opacity-100 shadow-lg"
			>
				<h3 class="text-center">Trading Stands</h3>
				<div
					class="grid w-full grid-cols-4 gap-5"
					id="tradingStands"
				></div>
			</div>
		</div>
		<div
			class="fixed inset-0 z-50 flex hidden h-full w-full items-center justify-center bg-black/20"
			id="marketOverlay"
		>
			<div
				class="h-[90%] w-[90%] rounded-2xl bg-white p-6 opacity-100 shadow-lg"
			>
				<h3 class="text-center">Marketplace</h3>
				<div
					class="grid w-full grid-cols-2 gap-5"
					id="marketplace"
				></div>
			</div>
		</div>
	</div>`;
	window.addEventListener("contextmenu", function (e) {
		e.preventDefault();
	});
	render(htmlElement, container);
	document.querySelectorAll(".overlay-button").forEach((element) => {
		let overlay = document.getElementById(element.dataset.pointer);
		overlay.children[0].addEventListener("click", (e) => {
			e.stopPropagation();
		});
		overlay.addEventListener("click", (e) => {
			overlay.classList.toggle("hidden");
		});
		element.addEventListener("click", (e) => {
			overlay.classList.toggle("hidden");
		});
	});

	document.querySelectorAll(".box-heading").forEach((element) => {
		element.addEventListener("click", () => {
			element.parentElement.children[1].classList.toggle("hidden");
		});
	});
	document.getElementById("test").addEventListener("click", (e) => {
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
	let plot = document.getElementById("plot");
	let money = document.getElementById("money");
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
	var gameDocData = gameDocSnapshot.data();
	var availableCrops = gameDocData.availableCrops;
	console.log(availableCrops);
	var timer = document.getElementById("timer");
	setInterval(() => {
		let seconds = Math.ceil((gameDocData.endTimestamp - Date.now()) / 1000);
		if (seconds < 0) {
			seconds = 0;
		}
		if (seconds <= 5) {
			timer.style.color = "red";
		} else {
			timer.style.color = "black";
		}
		timer.innerText =
			Math.floor(seconds / 60) +
			":" +
			(seconds % 60).toString().padStart(2, "0");
	});
	var playerData = playerSnapshot.data();

	var seedButtons = {};
	let selectedSeed = "";
	Object.keys(availableCrops).forEach((crop) => {
		let container = document.createElement("div");
		container.style.backgroundImage = `url('/crops/${crop}.png')`;
		let content = html`<p class="absolute right-1 bottom-0 text-sm">
			${uto0(playerData.seeds[crop])}
		</p>`;
		document.getElementById("seeds").appendChild(container);
		render(content, container);
		container.addEventListener("click", (e) => {
			if (playerData.seeds[crop] == 0) {
				return;
			}
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

		const offeringDiv = html` <label class="mr-2 whitespace-nowrap"
				>${crop}:</label
			>
			<input
				type="number"
				class="w-25 rounded border border-gray-300 px-2 py-1"
			/>,
			<input
				type="number"
				class="w-25 rounded border border-gray-300 px-2 py-1"
			/>price per`;
		const offeringContainer = document.createElement("div");
		render(offeringDiv, offeringContainer);
		offeringContainer.children[1].addEventListener("change", (e) => {
			if (
				parseInt(offeringContainer.children[1].value) >
				playerData.crops[crop]
			) {
				offeringContainer.children[1].value = playerData.crops[crop];
			}
			if (parseInt(offeringContainer.children[1].value) < 0) {
				offeringContainer.children[1].value = 0;
			}
		});
		offeringContainer.children[2].addEventListener("change", (e) => {
			if (parseInt(offeringContainer.children[2].value) < 0) {
				offeringContainer.children[2].value = 0;
			}
		});
		document.getElementById("offers").appendChild(offeringContainer);

		let cropRow = html`<div class="flex h-20 w-full gap-10">
			<div class="text-center">
				<div
					class="h-20 w-20 bg-contain bg-no-repeat"
					style="background-image: url('/crops/${crop}.png');"
				></div>
				<p>${crop}</p>
			</div>
			<div>
				<p>Harvest in:</p>
				<p>Minimum seasons: ${availableCrops[crop].minSeasons}</p>
				<p>Maximum scored: ${availableCrops[crop].max}</p>
			</div>
			<div class="flex gap-2">
				<div>
					<input class="w-30" type="number" min="0" />
					<p>Total Cost: <span>0</span></p>
					<p>
						Price per:
						<span>${availableCrops[crop].basePrice}</span>
					</p>
				</div>
				<button class="rounded bg-blue-500 px-4 py-2 text-white">
					Buy
				</button>
			</div>
		</div>`;
		let temp = document.createElement("div");
		render(cropRow, temp);
		console.log(temp);
		let buyFields = temp.children[0].children[2].children[0];
		buyFields.children[0].addEventListener("change", (e) => {
			let amount = parseInt(buyFields.children[0].value);
			console.log(amount);
			if (isNaN(amount) || amount < 0) {
				amount = 0;
			}
			let totalCost = Math.round(
				availableCrops[crop].basePrice * Math.pow(amount, 0.9),
			);
			if (totalCost > playerData.money) {
				amount = Math.floor(
					Math.pow(
						playerData.money / availableCrops[crop].basePrice,
						1 / 0.9,
					),
				);
				buyFields.children[0].value = amount;
				totalCost = Math.round(
					availableCrops[crop].basePrice * Math.pow(amount, 0.9),
				);
			}
			console.log(totalCost);
			let pricePer = totalCost / amount || availableCrops[crop].basePrice;
			buyFields.children[1].children[0].innerText = totalCost;
			buyFields.children[2].children[0].innerText = pricePer.toFixed(2);
		});
		let buyButton = temp.children[0].children[2].children[1];
		buyButton.addEventListener("click", (e) => {
			let amount = parseInt(buyFields.children[0].value);
			console.log(amount);
			if (isNaN(amount) || amount <= 0) {
				return;
			}
			let totalCost = Math.round(
				availableCrops[crop].basePrice * Math.pow(amount, 0.9),
			);
			playerData.money -= totalCost;
			playerData.seeds[crop] += amount;
			buyFields.children[0].value = 0;
			buyFields.children[1].children[0].innerText = 0;
			buyFields.children[2].children[0].innerText = 0;
			fetch("http://localhost:3000/buySeed", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					gameId: args["gameId"],
					seed: crop,
					count: amount,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				},
			});
		});
		document.getElementById("marketplace").appendChild(temp.children[0]);
	});

	money.innerText = playerData.money;

	playerData = {
		_crops: playerData.crops,
		_money: playerData.money,
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
		get money() {
			return this._money;
		},
		set money(val) {
			money.innerText = val;
			this._money = val;
		},
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
				hovering = false;
			}
			if (tooltip.numHover == 0) {
				tooltip.element.style.opacity = 0;
			}
		});
		cell.addEventListener("mousemove", function (e) {
			if (playerData.plot[i]?.type > "")
				tooltip.element.style.opacity = 1;
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
	onSnapshot(gameDoc, (docSnap) => {
		if (docSnap.exists() && timer.innerText == "0:00") {
			let data = docSnap.data();
			gameDocData = data;
			availableCrops = data.availableCrops;
			Object.keys(availableCrops).forEach((crop) => {
				if (seedButtons[crop]) {
					seedButtons[crop].children[0].innerText =
						playerData.seeds[crop];
				}
			});
			let seconds = Math.ceil((data.endTimestamp - Date.now()) / 1000);
			if (seconds < 0) {
				seconds = 0;
			}
			timer.innerText =
				Math.floor(seconds / 60) +
				":" +
				(seconds % 60).toString().padStart(2, "0");
		}
	});
	onSnapshot(playerRef, (docSnap) => {
		if (docSnap.exists()) {
			let data = docSnap.data();
			playerData.crops = data.crops;
			playerData.money = data.money;
			playerData.plot = data.plot;
			playerData.seeds = data.seeds;
		} else {
			console.log("No such document!");
		}
	});
}
