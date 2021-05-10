import * as fs from "fs";

import loadConfig from "./config/loadConfig";
import startProxyServer from "./proxy/startProxyServer";
import startServer from "./gateway/startServer";
import { updateConfigContext } from "./config/configContext";
import useLogger from "./useLogger";

const logger = useLogger({ name: "main" });

function main() {
  const configPath = process.argv[2] ?? "config.json";
  if (!configPath || !fs.existsSync(configPath)) {
    logger.info(
      { configPath },
      `${process.argv[0]} ${process.argv[1]} config-file-path`
    );
    return;
  }
  logger.info({ configPath }, "Use config path");
  updateConfigContext({ configPath });

  const config = loadConfig();
  if (config.gateway) {
    logger.info({ config: config.gateway }, "Start gateway");
    config.gateway.map(startServer);
  }

  if (config.proxy) {
    logger.info({ config: config.proxy }, "Start proxy");
    config.proxy.map(startProxyServer);
  }
}

main();
