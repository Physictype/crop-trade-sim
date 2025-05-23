import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firebaseApp, firebaseAuth } from "../firebase.js";
import { signInWithEmailLink } from "firebase/auth";

export async function renderElement(container, args) {
	const email = localStorage.getItem("email");
	const result = await signInWithEmailLink(
		firebaseAuth,
		email,
		window.location.href,
	);
	console.log(result);
}
