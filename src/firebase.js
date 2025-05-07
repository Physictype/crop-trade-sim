import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyDms65B_kroi40_zBsD0FXJPlZsYU0NH00",
	authDomain: "crop-trade-sim.firebaseapp.com",
	projectId: "crop-trade-sim",
	storageBucket: "crop-trade-sim.firebasestorage.app",
	messagingSenderId: "454134303518",
	appId: "1:454134303518:web:0919802f0d45847e8b970f",
	measurementId: "G-2J79PGGSTD",
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth();

export const firestore = getFirestore(firebaseApp);
