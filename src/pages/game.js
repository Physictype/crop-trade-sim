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

function nestedIndex(obj, path) {
	let curr = obj;
	path.split(".").forEach((segment) => {
		curr = curr[segment];
	});
	return curr;
}

function expandKeys(obj,path) {
    if (path.split(".").length == 1) {
        if (path == "*") {
            return Object.keys(obj);
        } else {
            return path;
        }
    }
    let split = path.split(/\.(.*)/s);
    let head = split[0];
    let tail = split[1];
    let res = [];
    if (head == "*") {
        Object.keys(obj).forEach((key) => {
            expandKeys(obj[key],tail).forEach((pathTail) => {
                res.push(key+"."+pathTail);
            });
        });
    } else {
        expandKeys(obj[head],tail).forEach((pathTail) => {
            res.push(head+"."+pathTail);
        });
    }
    return res;
}

function evaluateUpgrade(data, upgrade, target) {
	if (typeof upgrade == "undefined") {
		return NaN;
	}
	if (typeof upgrade == "number") {
		return upgrade;
	}
    if (upgrade == "this") {
        return nestedIndex(data,target);
    }
	if (typeof upgrade == "string") {
		return nestedIndex(data, upgrade);
	}
	let leftEval = evaluateUpgrade(data, upgrade.left);
	let rightEval = evaluateUpgrade(data, upgrade.right);
	switch (upgrade.operation) {
		case "+":
			return leftEval + rightEval;
		case "-":
			return leftEval - rightEval;
		case "*":
			return leftEval * rightEval;
		case "/":
			return leftEval / rightEval;
		case "&":
			return leftEval & rightEval;
		case "|":
			return leftEval | rightEval;
		default:
			return NaN;
	}
}
function applyUpgradeBundles(_player, _data) {
	let data = _.cloneDeep(_data);
	data.player = _.cloneDeep(_player);
    _player.upgradeBundles.forEach((upgradeBundle) => {
        upgradeBundle.upgrades.forEach((upgrade) => {
            let _data = _.cloneDeep(data);
            expandKeys(upgrade.target).forEach((key) => {
                nestedIndex(data.player,key) = evaluateUpgrade(_data, upgrade, key);
            });
        });
    })
	return data.player;
}

async function renderTradeStand(container, playerId, gameId, availableCrops) {
	let playerRef = doc(firestore, "games", gameId, "players", playerId);
	let playerData = (await getDoc(playerRef)).data();
	let nickname = playerData.nickname || playerId;
	let offers = playerData.offers || {};
	const htmlElement = html`<div>
		User <span class="font-bold">${nickname}</span>
		<table class="m-2 w-full items-center border-2 p-2 text-center">
			<tr>
				<td>Crop</td>
				<td>Amount</td>
				<td>Price Per</td>
			</tr>
		</table>
		<table class="m-2 w-full items-center border-2 p-2 text-center"></table>
		<button class="w-full text-center">Trade!</button>
	</div>`;
	let temp = document.createElement("div");
	render(htmlElement, temp);
	container.appendChild(temp.children[0]);
	let tradingStand = container.children[container.children.length - 1];
	let table = container.children[container.children.length - 1].children[1];
	Object.keys(availableCrops).forEach((crop) => {
		let rowContents = html`<td>${crop}</td>
			<td></td>
			<td></td>`;
		let row = document.createElement("tr");
		render(rowContents, row);
		table.appendChild(row);
	});
	table.children[table.children.length - 1].classList.add(
		"border-b-4",
		"border-double",
	);
	temp = document.createElement("div");
	let tradeHeading = html`<tr>
		<td>Crop</td>
		<td>Number</td>
		<td>Total Cost</td>
	</tr>`;
	let tradeFields = html`<tr>
		<td><select></select></td>
		<td><input type="number" min="0" class="w-20"></input></td>
		<td>0</td>
	</tr>`;
	render(tradeHeading, temp);
	table.appendChild(temp.children[0]);
	temp = document.createElement("div");
	render(tradeFields, temp);
	table.appendChild(temp.children[0]);
	let tradeRow = table.children[table.children.length - 1];
	tradeRow.children[0].children[0].addEventListener("change", (e) => {
		tradeRow.children[1].children[0].value = 0;
		tradeRow.children[2].innerText = 0;
	});
	tradeRow.children[1].children[0].addEventListener("change", (e) => {
		let amount = parseInt(tradeRow.children[1].children[0].value);
		if (isNaN(amount) || amount < 0) {
			amount = 0;
		}
		let crop = tradeRow.children[0].children[0].value;
		if (amount > uto0(offers[crop]?.num)) {
			amount = uto0(offers[crop]?.num);
			tradeRow.children[1].children[0].value = amount;
			tradeRow.children[2].innerText =
				amount * (offers[crop]?.pricePer || 0);
		}
		let pricePer = offers[crop]?.pricePer || 0;
		let totalCost = Math.round(pricePer * amount);
		if (totalCost > playerData.money) {
			amount = Math.floor(playerData.money / pricePer);
			tradeRow.children[1].children[0].value = amount;
			totalCost = Math.round(pricePer * amount);
		}
		tradeRow.children[2].innerText = totalCost;
	});
	Object.keys(availableCrops).forEach((crop) => {
		let option = document.createElement("option");
		option.innerHTML = crop;
		option.value = crop;
		table.children[
			table.children.length - 1
		].children[0].children[0].appendChild(option);
	});
	onSnapshot(playerRef, (playerDocSnap) => {
		if (playerDocSnap.exists()) {
			let playerData = playerDocSnap.data();
			offers = playerData.offers;
			let rows = table.children;
			for (let i = 1; i < rows.length - 2; i++) {
				let cropName = rows[i].children[0].innerText;
				rows[i].children[1].innerText =
					parseInt(uto0(offers[cropName]?.num)) || 0;
				rows[i].children[2].innerText =
					parseInt(uto0(offers[cropName]?.pricePer)) || 0;
			}
		}
	});
	tradingStand.children[tradingStand.children.length - 1].addEventListener(
		"click",
		(e) => {
			let crop = tradeRow.children[0].children[0].value;
			let amount = parseInt(tradeRow.children[1].children[0].value);
			if (isNaN(amount) || amount <= 0) {
				return;
			}
			let totalCost = Math.round((offers[crop]?.pricePer || 0) * amount);
			if (totalCost > playerData.money) {
				return;
			}
			fetch("http://localhost:3000/tradeFromOffer", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					gameId: gameId,
					targetId: playerId,
					type: crop,
					num: amount,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				},
			});
		},
	);
}

export async function renderElement(container, args) {
	const htmlElement = html`<div class="pointer-none select-none">
		<div class="flex w-full">
			<div class="flex-1/2">
				<div>Game ID <span id="gameId"></span></div>
				<div>Money: <span id="money"></span></div>
				<div>Season: <span id="season">Spring</span></div>
				<div>Stage: <span id="stage">Planting</span></div>
			</div>
			<div class="flex-1/2 text-right text-6xl" id="timer">0:00</div>
		</div>
		<br />
		<div class="flex gap-1">
			<div
				class="grid border-1 bg-amber-100 [&>*]:h-full [&>*]:w-full [&>*]:border-1 [&>*]:bg-contain [&>*]:bg-no-repeat [&>*]:object-contain"
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
					</div>
				</div>
			</div>
		</div>
		<div
			class="pointer-events-none absolute m-1 h-37 w-50 bg-amber-300 p-2 opacity-0"
			id="tooltip"
		></div>
		<div
			class="fixed inset-0 z-50 !hidden flex h-full w-full items-center justify-center bg-black/20"
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
			class="fixed inset-0 z-50 !hidden flex h-full w-full items-center justify-center bg-black/20"
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
			overlay.classList.toggle("!hidden");
		});
		element.addEventListener("click", (e) => {
			overlay.classList.toggle("!hidden");
		});
	});

	document.querySelectorAll(".box-heading").forEach((element) => {
		element.addEventListener("click", () => {
			element.parentElement.children[1].classList.toggle("!hidden");
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
	if (gameDocSnapshot.exists() == false) {
		console.error("Game not found");
		window.location.replace("/");
	}
	var gameDocData = gameDocSnapshot.data();
	plot.style.gridTemplateColumns = `repeat(${gameDocData.plotWidth}, minmax(0, 1fr)`;
	plot.style.gridTemplateRows = `repeat(${gameDocData.plotHeight}, minmax(0, 1fr)`;
	let maxDim = Math.max(gameDocData.plotWidth, gameDocData.plotHeight);
	plot.style.width = (600 / maxDim) * gameDocData.plotWidth + "px";
	plot.style.height = (600 / maxDim) * gameDocData.plotHeight + "px";
	document.getElementById("season").innerText = [
		"Spring",
		"Summer",
		"Fall",
		"Winter",
	][gameDocData.season];
	document.getElementById("stage").innerText = gameDocData.roundSection;

	var availableCrops = gameDocData.availableCrops;
	console.log(availableCrops);
	var timer = document.getElementById("timer");
	setInterval(() => {
		let seconds = Math.ceil((gameDocData.endTimestamp - Date.now()) / 1000);
		if (isNaN(seconds)) {
			seconds = 0;
		}
		if (seconds < 0) {
			seconds = 0;
		}
		if (seconds <= 10) {
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
	var cropDisplays = {};
	let selectedSeed = "";
	Object.keys(availableCrops).forEach((crop) => {
		let cropContainer = document.createElement("div");
		cropContainer.style.backgroundImage = `url('/crops/${crop}.png')`;
		let cropContent = html`<p class="absolute right-1 bottom-0 text-sm">
			${uto0(playerData.crops[crop])}
		</p>`;
		document.getElementById("crops").appendChild(cropContainer);
		cropDisplays[crop] = cropContainer;
		render(cropContent, cropContainer);
		// Create seed button
		let seedContainer = document.createElement("div");
		seedContainer.style.backgroundImage = `url('/crops/${crop}.png')`;
		let seedContent = html`<p class="absolute right-1 bottom-0 text-sm">
			${uto0(playerData.seeds[crop])}
		</p>`;
		document.getElementById("seeds").appendChild(seedContainer);
		render(seedContent, seedContainer);
		seedContainer.addEventListener("click", (e) => {
			console.log(gameDocData.roundSection);
			if (
				gameDocData.roundSection != "Planting" ||
				gameDocData.round == 0
			) {
				return;
			}
			if (uto0(playerData.seeds[crop]) == 0) {
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
		seedButtons[crop] = seedContainer;

		// Create offering input
		const offeringDiv = html` <label class="mr-2 whitespace-nowrap"
				>${crop}:</label
			>
			<input
				type="number"
				class="w-20 rounded border border-gray-300 px-2 py-1"
			/>,
			<input
				type="number"
				class="w-20 rounded border border-gray-300 px-2 py-1"
			/>price per`;
		const offeringContainer = document.createElement("div");
		render(offeringDiv, offeringContainer);
		console.log(offeringContainer);
		offeringContainer.children[1].value =
			playerData.offers[crop]?.num || "";
		offeringContainer.children[2].value =
			playerData.offers[crop]?.pricePer || "";
		offeringContainer.children[1].addEventListener("change", (e) => {
			if (
				gameDocData.roundSection == "Trading" ||
				gameDocData.currentRound == 0
			) {
				offeringContainer.children[1].value = "";
				return;
			}
			if (
				parseInt(offeringContainer.children[1].value) >
				uto0(playerData.crops[crop])
			) {
				offeringContainer.children[1].value = uto0(
					playerData.crops[crop],
				);
			}
			if (parseInt(offeringContainer.children[1].value) < 0) {
				offeringContainer.children[1].value = 0;
			}
			fetch("http://localhost:3000/offerCrop", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					gameId: args["gameId"],
					crop: crop,
					num: parseInt(offeringContainer.children[1].value) || 0,
					price: parseFloat(offeringContainer.children[2].value) || 0,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				},
			});
		});
		offeringContainer.children[2].addEventListener("change", (e) => {
			if (
				gameDocData.roundSection == "Trading" ||
				gameDocData.currentRound == 0
			) {
				offeringContainer.children[2].value = "";
				e.preventDefault();
				return;
			}
			if (parseInt(offeringContainer.children[2].value) < 0) {
				offeringContainer.children[2].value = 0;
			}
			fetch("http://localhost:3000/offerCrop", {
				method: "POST",
				credentials: "include",
				body: JSON.stringify({
					gameId: args["gameId"],
					crop: crop,
					num: parseInt(offeringContainer.children[1].value) || 0,
					price: parseFloat(offeringContainer.children[2].value) || 0,
				}),
				headers: {
					"Content-type": "application/json; charset=UTF-8",
				},
			});
		});
		document.getElementById("offers").appendChild(offeringContainer);

		// Create marketplace seed row
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
			if (gameDocData.round == 0) {
				return;
			}
			let amount = parseInt(buyFields.children[0].value);
			console.log(amount);
			if (isNaN(amount) || amount <= 0) {
				return;
			}
			let totalCost = Math.round(
				availableCrops[crop].basePrice * Math.pow(amount, 0.9),
			);
			playerData.money -= totalCost;
			playerData.seeds[crop] = uto0(playerData.seeds[crop]) + amount;
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

		// Create trading stand
	});

	money.innerText = playerData.money;

	playerData = {
		crops: new Proxy(playerData.crops, {
			set(target, prop, value) {
				cropDisplays[prop].children[0].innerText = uto0(value);
				target[prop] = uto0(value);
				return true;
			},
		}),
		_money: playerData.money,
		seeds: new Proxy(playerData.seeds, {
			set(target, prop, value) {
				seedButtons[prop].children[0].innerText = uto0(value);
				target[prop] = uto0(value);
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

	for (let i = 0; i < gameDocData.plotWidth * gameDocData.plotHeight; i++) {
		let cell = document.createElement("div");
		cell.innerText = "";
		cell.addEventListener("click", function () {
			if (
				gameDocData.roundSection != "Planting" ||
				gameDocData.round == 0
			) {
				return;
			}
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

	getDocs(collection(gameDoc, "players")).then((snapshot) => {
		snapshot.forEach((doc) => {
			if (doc.id == args["playerId"]) {
				return;
			}
			renderTradeStand(
				document.getElementById("tradingStands"),
				doc.id,
				args["gameId"],
				availableCrops,
			);
		});
	});

	onSnapshot(gameDoc, (docSnap) => {
		let data = docSnap.data();
		if (timer.innerText == "0:00" || data.roundSection == "Trading") {
			gameDocData = data;
			document.getElementById("season").innerText = [
				"Spring",
				"Summer",
				"Fall",
				"Winter",
			][data.season];
			document.getElementById("stage").innerText = data.roundSection;
			getDoc(playerRef).then((playerDocSnap) => {
				let data = playerDocSnap.data();
				playerData.crops = data.crops;
				playerData.money = data.money;
				Object.keys(data.plot).forEach((key) => {
					if (key < 0 || key >= plot.children.length) {
						return;
					}
					playerData.plot[key] = data.plot[key];
				});
				console.log(playerData.seeds);
				Object.keys(data.seeds).forEach((key) => {
					console.log(key, data.seeds[key]);
					playerData.seeds[key] = data.seeds[key];
				});
				Object.keys(availableCrops).forEach((crop) => {
					if (seedButtons[crop]) {
						seedButtons[crop].children[0].innerText = uto0(
							playerData.seeds[crop],
						);
					}
				});
			});
			let seconds = Math.ceil((data.endTimestamp - Date.now()) / 1000);
			if (seconds < 0) {
				seconds = 0;
			}
			timer.innerText =
				Math.floor(seconds / 60) +
				":" +
				(seconds % 60).toString().padStart(2, "0");
			let offersElement = document.getElementById("offers");
			if (gameDocData.roundSection == "Trading") {
				offersElement.classList.add("!hidden");
				Array.from(offersElement.children).forEach((element) => {
					element.children[1].disabled = true;
					element.children[2].disabled = true;
				});
			} else {
				Array.from(offersElement.children).forEach((element) => {
					element.children[1].disabled = false;
					element.children[2].disabled = false;
				});
			}
		}
	});
}
