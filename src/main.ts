import * as fs from "fs";

import { loadConfig } from "./config";
import startProxyServer from "./proxy/startProxyServer";
import startServer from "./gateway/startServer";
import useLogger from "./useLogger";

const logger = useLogger({ name: "main" });

function main() {
  const configPath = process.argv[2] ?? "config.json";
  if (!configPath || !fs.existsSync(configPath)) {
    logger.info(process.argv[0], process.argv[1], "config-file-path");
    return;
  }
  const config = loadConfig(configPath);
  if (config.gateway) {
    logger.info(config.gateway, "Start gateway");
    config.gateway.map(startServer);
  }

  if (config.proxy) {
    logger.info(config.proxy, "Start proxy");
    config.proxy.map(startProxyServer);
  }
}

main();
