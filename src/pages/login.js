import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firebaseApp, firebaseAuth } from "../firebase.js";
import { sendSignInLinkToEmail } from "firebase/auth";

export function renderElement(container, args) {
	const htmlElement = html`
		<div class="items-center self-center">
			<h2>Login</h2>
			<input id="email" type="email" class="border-1 border-black" />
			<br />
			<button
				id="sendLink"
				class="rounded-xl bg-blue-500 p-2 text-amber-50"
			>
				Send Link (I love the fact I'm just using this for tests)
			</button>
		</div>
	`;
	render(htmlElement, container);

	document.getElementById("sendLink").addEventListener("click", function () {
		fetch("https://localhost:3000/buySeed", {
			method: "POST",
            credentials: 'include',
			body: JSON.stringify({
				userId: 1,
				gameId: 28291038,
				title: "Fix my bugs",
				completed: false,
				seed: "wheat",
				count: 1,
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8",
			},
		});
		// let email = document.getElementById("email").value;
		// var actionCodeSettings = {
		// 	// URL you want to redirect back to. The domain (www.example.com) for this
		// 	// URL must be in the authorized domains list in the Firebase Console.
		// 	url: "http://localhost:5173/login",
		// 	// This must be true.
		// 	handleCodeInApp: true,
		// 	iOS: {
		// 		bundleId: "com.example.ios",
		// 	},
		// 	android: {
		// 		packageName: "com.example.android",
		// 		installApp: true,
		// 		minimumVersion: "12",
		// 	},
		// 	// dynamicLinkDomain: 'crops.physictype.dev'
		// };

		// sendSignInLinkToEmail(firebaseAuth, email, actionCodeSettings)
		// 	.then(() => {
		// 		console.log("yay!");
		// 		// The link was successfully sent. Inform the user.
		// 		// Save the email locally so you don't need to ask the user for it again
		// 		// if they open the link on the same device.
		// 		window.localStorage.setItem("email", email);
		// 		// ...
		// 	})
		// 	.catch((error) => {
		// 		console.error("Firebase Error Code:", error.code);
		// 		console.error("Firebase Error Message:", error.message);
		// 	});
	});
}
