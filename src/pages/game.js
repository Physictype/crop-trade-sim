import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firestore } from "../firebase.js";
import { doc, getDoc } from "firebase/firestore";

export async function renderElement(container, args) {
	const htmlElement = html` <div>Game ID <span id="gameId"></span></div> `;
	render(htmlElement, container);
	document.getElementById("gameId").innerText = args["gameId"];
	var gameDoc = await getDoc(doc(firestore, "games", args["gameId"]));
	console.log(gameDoc.data());
}
