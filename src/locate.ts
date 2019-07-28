"use strict";

import { CondaLocator } from "./locators/condaLocator";
import { PathLocator } from "./locators/pathLocator";
import { CondaEnvLocator } from "./locators/condaEnvLocator";
import { CondaEnvFileLocator } from "./locators/condaEnvFileLocator";
import { locateAll } from "./locators/locateAll";

console.log("Path:")
let path = new PathLocator();
console.log(path.locateJupyterLabExecutables());

console.log("\nConda:")
let conda = new CondaLocator();
console.log(conda.locateJupyterLabExecutables());

console.log("\nConda env:")
let condaEnv = new CondaEnvLocator();
console.log(condaEnv.locateJupyterLabExecutables());

console.log("\nConda env file:")
let condaEnvFile = new CondaEnvFileLocator();
console.log(condaEnvFile.locateJupyterLabExecutables());

console.log("\nInfo:")
console.log(locateAll());