"use strict";

import { dirname } from "path";

import { PathLocator } from "./pathLocator";
import { CondaLocator } from "./condaLocator";
import { CondaEnvLocator } from "./condaEnvLocator";
import { CondaEnvFileLocator } from "./condaEnvFileLocator";

import { PythonEnvironment } from "./environment";
import { getUniqueStrings } from "./utils";

export function locateAll () {
  let execPaths = [];

  let path = new PathLocator();
  execPaths.push(...path.locateJupyterLabExecutables());

  let conda = new CondaLocator();
  execPaths.push(...conda.locateJupyterLabExecutables());

  let condaEnv = new CondaEnvLocator();
  execPaths.push(...condaEnv.locateJupyterLabExecutables());

  let condaEnvFile = new CondaEnvFileLocator();
  execPaths.push(...condaEnvFile.locateJupyterLabExecutables());

  let envInfo = getUniqueStrings(execPaths).map(value => (new PythonEnvironment(dirname(value))).getInfo());

  return envInfo;
}