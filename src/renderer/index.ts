import "../style/base.css"
import { locateAll } from "../common/locate";
import * as spinner from "./spinner";
import { ipcRenderer } from "electron";
import { EnvInterface } from "../common/envInterface";

let index: number;
let didShowEnvs = false;

function showEnvs(envs: EnvInterface[]) {
  if (didShowEnvs) {
    return;
  }
  didShowEnvs = true;
  spinner.hide();

  const app = document.getElementById("app");
  if (app) {
    let divs = document.createElement("div");
    divs.setAttribute("id", "env-list")
    for (const env of envs) {
      let div = document.createElement("div");
      div.setAttribute("class", "env");
      div.innerHTML = env.path;
      div.addEventListener("click", () => {
        ipcRenderer.send("launch-server", index, env);
        divs.style.display = "none";
        spinner.show();
      });
      divs.appendChild(div);
    }
    app.appendChild(divs);
  }
}

spinner.show();
ipcRenderer.once("set-index", (event, newIndex: number) => {
  index = newIndex;
  locateAll().then((envs) => {
    ipcRenderer.send("cache-envs", envs);
    showEnvs(envs);
  });
});

ipcRenderer.once("show-envs", (event, envs) => {
  showEnvs(envs);
});
