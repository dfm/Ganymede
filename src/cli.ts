import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

export function installCLI () {
  let script_path: string;
  script_path = path.join(path.resolve(path.dirname(path.dirname(__dirname))), "ganymede.sh");

  let target_path = "/usr/local/bin/ganymede";

  fs.unlink(target_path, function () {
    fs.symlink(script_path, target_path, function (error) {
      if (error != null) console.log(error);
    });
  });
}