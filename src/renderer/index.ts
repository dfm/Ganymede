import { locateAll } from "../common/locate";
import * as spinner from "./spinner";

spinner.show();

locateAll().then((instances) => {
  console.log(instances);
  spinner.hide();
});
