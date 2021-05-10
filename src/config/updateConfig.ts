import * as fs from "fs";

import Config from "./models/Config";
import dateFnsFormat from "date-fns/format";
import { getConfigContext } from "./configContext";

export default function updateConfig(newConfig: Config): void {
  const backupTimestamp = dateFnsFormat(new Date(), "yyyyMMddHHmmss");
  const { configPath } = getConfigContext();
  fs.renameSync(configPath, `${configPath}.${backupTimestamp}`);
  return fs.writeFileSync(
    configPath,
    JSON.stringify(newConfig, null, 2),
    "utf8"
  );
}
