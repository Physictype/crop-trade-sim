import { render } from "preact";
const routes = {
	"/login": () => import("/pages/login.js"),
	"/": () => import("/pages/main.js"),
	"/404": () => import("/pages/404.js"),
	// "/dashboard": () => import("./pages/dashboard.js"),
	// "/verify": () => import("./pages/verify.js"),
};
console.log("hi");
async function loadRoute() {
	const path = location.pathname;
	console.log(path);
	const route = routes[path] || routes["/404"];
	console.log("u gud bro");
	const module = await route();
	module.renderElement(document.getElementById("app"));
	// console.log(module.htmlElement);
	// render(module.htmlElement,document.getElementById("app"));
}

window.addEventListener("hashchange", loadRoute);
window.addEventListener("load", loadRoute);
