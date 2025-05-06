import { render } from "preact";
const routes = {
	"/login": () => import("/pages/login.js"),
	// "/dashboard": () => import("./pages/dashboard.js"),
	// "/verify": () => import("./pages/verify.js"),
};

async function loadRoute() {
	const path = location.pathname;
	const route = routes[path] || routes["/login"];
	const module = await route();
	module.renderElement(document.getElementById("app"));
	// console.log(module.htmlElement);
	// render(module.htmlElement,document.getElementById("app"));
}

window.addEventListener("hashchange", loadRoute);
window.addEventListener("load", loadRoute);
