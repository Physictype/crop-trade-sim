import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firebaseApp, firebaseAuth } from "../firebase.js";
import { sendSignInLinkToEmail } from "firebase/auth";

export function renderElement(container) {
	const htmlElement = html` <div>404 RAHHHH</div> `;
	render(htmlElement, container);
}
