"use strict";

import path from "path";
import yargs from "yargs";
import { app } from "electron";

import * as menu from "./menu";
import * as ganymede from "./ganymede";
import untildify from "../common/untildify";

let openFilePath: string | null = null;

function processArgs(args: any) {
  const newPath = args["path-environment"];
  if (newPath) {
    process.env.PATH = newPath as string;
  }

  let cwd = untildify("~");
  const execFrom = args["executed-from"];
  if (execFrom) {
    cwd = execFrom as string;
  }

  if (args._.length) {
    args._.forEach((element: string) => {
      let filePath = element;
      if (execFrom) {
        filePath = path.resolve(cwd, element);
      }
      ganymede.createWindow(filePath);
    });
  } else if (openFilePath) {
    ganymede.createWindow(openFilePath);
  } else {
    ganymede.createWindow(cwd);
  }
}

const lock = app.requestSingleInstanceLock();

if (!lock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    let args = yargs.parse(commandLine.slice(1));
    if (!args["executed-from"]) {
      args["executed-from"] = workingDirectory;
    }
    processArgs(args);
  });

  app.on("open-file", (event, filePath) => {
    openFilePath = filePath;
  });

  app.on("ready", () => {
    menu.setup(ganymede.createWindow);
    let args = yargs.parse(process.argv.slice(1));
    if (!app.isPackaged) {
      args = yargs.parse(process.argv.slice(3));
    }
    processArgs(args);
  });

  app.on("activate", () => {
    ganymede.createWindowIfNone();
  });

  app.on("window-all-closed", function () {
    app.quit()
  });

  app.on("quit", function () {
    ganymede.quit();
  });
}