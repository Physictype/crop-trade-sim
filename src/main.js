import { render } from "preact";
const routes = {
	"/login": () => import("/pages/login.js"),
	"/": () => import("/pages/home.js"),
	"/game": () => import("/pages/game.js"),
	"/404": () => import("/pages/404.js"),
	"/finishLogin": () => import("/pages/finishLogin.js"),
	"/host": () => import("/pages/host.js"),
	// "/home": () => import("/pages/finishLogin.js"),
	// "/dashboard": () => import("./pages/dashboard.js"),
	// "/verify": () => import("./pages/verify.js"),
};
console.log("hi");
async function loadRoute() {
	const path = location.pathname;
	console.log(path);
	var route;
	var args = {};
	args["playerId"] = window.localStorage.getItem("userId") || null;
	console.log(args["playerId"]);
	if (path.includes("game")) {
		route = routes["/game"];
		args["gameId"] = path.substring(6);
	} else {
		route = routes[path] || routes["/404"];
	}
	if (path.includes("host")) {
		route = routes["/host"];
		args["gameId"] = path.substring(6);
	}
	console.log("u gud bro");
	const module = await route();
	module.renderElement(document.getElementById("app"), args);
	// console.log(module.htmlElement);
	// render(module.htmlElement,document.getElementById("app"));
}

window.addEventListener("hashchange", loadRoute);
window.addEventListener("load", loadRoute);
console.log("loaded");
if (window.localStorage.getItem("userId") === null) {
	window.location.replace("/login");
}
console.log(document.cookie);
