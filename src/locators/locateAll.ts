"use strict";

import { dirname } from "path";

import { PathLocator } from "./pathLocator";
import { CondaLocator } from "./condaLocator";
import { CondaEnvLocator } from "./condaEnvLocator";
import { CondaEnvFileLocator } from "./condaEnvFileLocator";

import { PythonEnvironment } from "./environment";
import { getUniqueStrings } from "./utils";

export async function locateAll () {
  let execPaths = [];

  const path = new PathLocator();
  execPaths.push(...(await path.locateJupyterLabExecutables()));

  const conda = new CondaLocator();
  execPaths.push(...(await conda.locateJupyterLabExecutables()));

  const condaEnv = new CondaEnvLocator();
  execPaths.push(...(await condaEnv.locateJupyterLabExecutables()));

  const condaEnvFile = new CondaEnvFileLocator();
  execPaths.push(...(await condaEnvFile.locateJupyterLabExecutables()));

  return await Promise.all(execPaths).then(async (paths) => {
    return await Promise.all(getUniqueStrings(paths).map(value => {
      return (new PythonEnvironment(dirname(value))).getInfo();
    }));
  });
}