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

	const idToken = await result.user.getIdToken(true);

	await fetch("http://localhost:3000/sessionLogin", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ idToken }),
		credentials: "include",
	});
	window.location.replace("/");
	window.localStorage.setItem("userId", result.user.uid);
}
