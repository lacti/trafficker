import * as fs from "fs";

import Config from "./models/Config";
import { getConfigContext } from "./configContext";

export default function loadConfig(): Config {
  return JSON.parse(fs.readFileSync(getConfigContext().configPath, "utf8"));
}
