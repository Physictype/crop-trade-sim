import htm from "htm";
import { h, render } from "preact";
const html = htm.bind(h);
import { firebaseApp, firebaseAuth } from "../firebase.js";
import { sendSignInLinkToEmail } from "firebase/auth";

export function renderElement(container) {
	const htmlElement = html`
		<div>
			<h2>Login</h2>
			<input id="email" type="email" />
			<button id="sendLink">Send Link</button>
		</div>
	`;
    render(htmlElement,container);
    console.log(document.getElementById("sendLink"))
	var actionCodeSettings = {
		// URL you want to redirect back to. The domain (www.example.com) for this
		// URL must be in the authorized domains list in the Firebase Console.
		url: "http://localhost:5173/login",
		// This must be true.
		handleCodeInApp: true,
		iOS: {
			bundleId: "com.example.ios",
		},
		android: {
			packageName: "com.example.android",
			installApp: true,
			minimumVersion: "12",
		},
		// dynamicLinkDomain: 'crops.physictype.dev'
	};
	console.log(firebaseAuth, sendSignInLinkToEmail);
	// sendSignInLinkToEmail(
	// 	firebaseAuth,
	// 	"atticus.j.lin@gmail.com",
	// 	actionCodeSettings
	// )
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
}
