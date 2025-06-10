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
		<div>
			<form>
				<label>Game ID</label>
				<input type="text" id="gameId" />
				<br />
				<label>Nickname: </label>
				<input type="text" id="nickname" />
				<br />
				<button id="joinButton">Join Game</button>
			</form>
		</div>
		<button class="overlay-button" data-pointer="newGameOverlay">
			Create Game
		</button>
		<div
			class="fixed inset-0 z-50 flex hidden h-full w-full items-center justify-center bg-black/20"
			id="newGameOverlay"
		>
			<div
				class="h-[90%] w-[90%] gap-2 overflow-y-auto rounded-2xl bg-white p-6 opacity-100 shadow-lg"
			>
				<h3 class="text-center">New Game</h3>
				<form class="scrollable flex flex-col" id="newGameForm">
					<h3 class="text-xl">Timing</h3>
					<label>Number of Rounds: </label>
					<input type="number" id="numRounds" value="10" />
					<label>Planting duration (seconds): </label>
					<input type="number" id="plantingTime" value="60" />
					<label>Offering duration (seconds): </label>
					<input type="number" id="offeringTime" value="40" />
					<label>Trading duration (seconds): </label>
					<input type="number" id="tradingTime" value="60" />
					<br />
					<label>Initial money: </label>
					<input type="number" id="initialMoney" value="100000" />
					<label>Plot width: </label>
					<input type="number" id="plotWidth" value="5" />
					<label>Plot height: </label>
					<input type="number" id="plotHeight" value="5" />
					<br />
					<h3 class="text-xl">Crops</h3>
					<label>Selected crops:</label>
					<div
						class="inline h-min items-center gap-2 space-x-1 bg-amber-100 p-1 wrap-anywhere [&>*]:inline-block [&>*]:rounded-md [&>*]:border-2 [&>*]:border-black [&>*]:p-1 [&>*]:text-center"
						id="cropList"
					></div>
					<label>All crops:</label>
					<div
						class="inline items-center gap-2 space-x-1 bg-amber-100 p-1 wrap-anywhere [&>*]:inline-block [&>*]:rounded-md [&>*]:border-2 [&>*]:border-black [&>*]:p-1 [&>*]:text-center"
						id="allCrops"
					></div>
					<br />
					<select id="cropType"></select
					><br />
					<div class="flex flex-col" id="cropProperties">
						<label>Base price</label>
						<input type="number" id="basePrice" value="100" /><br />
						<label>Utility of first crop</label>
						<input type="number" id="max" value="100" /><br />
						<label>Minimum growing seasons</label>
						<input type="number" id="minSeasons" value="3" /><br />
						<label>Harvestable seasons</label>
						<div>
							<input
								type="checkbox"
								id="springHarvestable"
								checked
							/>
							<input
								type="checkbox"
								id="summerHarvestable"
								checked
							/>
							<input
								type="checkbox"
								id="fallHarvestable"
								checked
							/>
							<input
								type="checkbox"
								id="winterHarvestable"
								checked
							/>
						</div>
					</div>

					<input type="submit" id="submitNewGame" value="Submit" />
				</form>
				<form class="gap-5"></form>
			</div>
		</div>
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
				gameId: document.getElementById("gameId").value,
				nickname: document.getElementById("nickname").value,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		})
			.then((value) => {
				if (value.ok || value.message !== "Game already started") {
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

	let currentRequest = {
		numRounds: 4,
		plantingTime: 100,
		offeringTime: 60,
		tradingTime: 150,
		initialMoney: 100000,
		plotWidth: 5,
		plotHeight: 5,
		availableCrops: {},
	};

	document.querySelectorAll("#newGameForm > input").forEach((el) => {
		el.addEventListener("change", (e) => {
			currentRequest[el.id] = parseInt(el.value);
		});
	});

	document.getElementById("basePrice").addEventListener("change", (e) => {
		currentRequest.availableCrops[cropTypeSelector.value].basePrice =
			parseInt(e.target.value);
	});
	document.getElementById("max").addEventListener("change", (e) => {
		currentRequest.availableCrops[cropTypeSelector.value].max = parseInt(
			e.target.value,
		);
	});
	document.getElementById("minSeasons").addEventListener("change", (e) => {
		currentRequest.availableCrops[cropTypeSelector.value].minSeasons =
			parseInt(e.target.value);
	});
	document
		.getElementById("springHarvestable")
		.addEventListener("change", (e) => {
			if (e.target.checked) {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap |= 0b0001;
			} else {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap &= ~0b0001;
			}
		});
	document
		.getElementById("summerHarvestable")
		.addEventListener("change", (e) => {
			if (e.target.checked) {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap |= 0b0010;
			} else {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap &= ~0b0010;
			}
		});
	document
		.getElementById("fallHarvestable")
		.addEventListener("change", (e) => {
			if (e.target.checked) {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap |= 0b0100;
			} else {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap &= ~0b0100;
			}
		});
	document
		.getElementById("winterHarvestable")
		.addEventListener("change", (e) => {
			if (e.target.checked) {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap |= 0b1000;
			} else {
				currentRequest.availableCrops[
					cropTypeSelector.value
				].seasonsMap &= ~0b1000;
			}
		});

	let cropTypeSelector = document.getElementById("cropType");
	cropTypeSelector.value = "";
	let cropProperties = document.getElementById("cropProperties");
	cropProperties.classList.add("!hidden");
	cropTypeSelector.addEventListener("change", (e) => {
		if (cropTypeSelector.value === "") {
			cropProperties.classList.add("!hidden");
			return;
		}
		cropProperties.classList.remove("!hidden");
		console.log("hello there");
		cropProperties.children[1].value =
			currentRequest.availableCrops[cropTypeSelector.value].basePrice;
		cropProperties.children[4].value =
			currentRequest.availableCrops[cropTypeSelector.value].max;
		cropProperties.children[7].value =
			currentRequest.availableCrops[cropTypeSelector.value].minSeasons;
		console.log(cropProperties.children[7]);
		console.log(
			currentRequest.availableCrops[cropTypeSelector.value].seasonsMap &
				2,
		);
		cropProperties.children[10].children[0].checked =
			currentRequest.availableCrops[cropTypeSelector.value].seasonsMap &
			0b0001;
		cropProperties.children[10].children[1].checked =
			currentRequest.availableCrops[cropTypeSelector.value].seasonsMap &
			0b0010;
		cropProperties.children[10].children[2].checked =
			currentRequest.availableCrops[cropTypeSelector.value].seasonsMap &
			0b0100;
		cropProperties.children[10].children[3].checked =
			currentRequest.availableCrops[cropTypeSelector.value].seasonsMap &
			0b1000;
	});
	// Create the crop list
	let allCropsContainer = document.getElementById("allCrops");
	let cropListContainer = document.getElementById("cropList");
	let crops = {};
	let selectedCropsFlags = {};
	await getDocs(collection(firestore, "cropData")).then((snapshot) => {
		snapshot.docs.forEach((doc) => {
			selectedCropsFlags[doc.id] = false;
			console.log(doc.id);
			let crop = doc.data();
			crops[doc.id] = crop;
			let el1 = document.createElement("div");
			el1.innerText = doc.id;
			el1.dataset.crop = doc.id;
			allCropsContainer.appendChild(el1);
			let el2 = el1.cloneNode(true);
			el2.classList.add("!hidden");
			cropListContainer.appendChild(el2);

			let option = document.createElement("option");
			option.value = doc.id;
			option.innerText = doc.id;
			option.classList.add("!hidden");
			cropTypeSelector.appendChild(option);
			el1.addEventListener("click", (e) => {
				el1.classList.toggle("!hidden");
				el2.classList.toggle("!hidden");
				option.classList.toggle("!hidden");
				selectedCropsFlags[doc.id] = true;
				currentRequest.availableCrops[doc.id] = {
					basePrice: crop.defaultPrice,
					max: crop.defaultMax,
					minSeasons: crop.defaultMinSeasons,
					seasonsMap: crop.defaultSeasonsMap,
				};
			});
			el2.addEventListener("click", (e) => {
				el1.classList.toggle("!hidden");
				el2.classList.toggle("!hidden");
				option.classList.toggle("!hidden");
				selectedCropsFlags[doc.id] = false;
				let substituteFound = false;
				Array.from(cropTypeSelector.children).forEach((el) => {
					if (substituteFound) {
						return;
					}
					if (!el.classList.contains("!hidden")) {
						cropTypeSelector.value = el.value;
						substituteFound = true;
					}
				});
				if (!substituteFound) {
					cropTypeSelector.value = "";
				}
				delete currentRequest.availableCrops[doc.id];
			});
		});
	});
	cropTypeSelector.value = "";
	document.getElementById("submitNewGame").addEventListener("click", (e) => {
		e.preventDefault();
		fetch("http://localhost:3000/createGame", {
			method: "POST",
			credentials: "include",
			body: JSON.stringify(currentRequest),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		}).then(async (value) => {
			console.log(value);
			if (value.ok) {
				window.location.pathname = "/host/" + (await value.text());
			} else {
				console.error("Failed to create game");
			}
		});
	});
}
