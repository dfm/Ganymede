import "../style/spinner.css"

export function show() {
  const app = document.getElementById("app");
  let spinner = document.getElementById("spinner");

  if (app && !spinner) {
    spinner = document.createElement("div");
    spinner.setAttribute("id", "spinner");
    let inner = document.createElement("div");
    inner.setAttribute("class", "lds-ring");
    inner.appendChild(document.createElement("div"));
    inner.appendChild(document.createElement("div"));
    inner.appendChild(document.createElement("div"));
    inner.appendChild(document.createElement("div"));
    spinner.appendChild(inner);
    app.appendChild(spinner);
  }

  if (spinner) {
    spinner.style.display = "block";
  }
}

export function hide() {
  let spinner = document.getElementById("spinner");
  if (spinner) {
    spinner.style.display = "none";
  }
}
