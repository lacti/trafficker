import * as fs from "fs";

import loadConfig from "./config/loadConfig";
import startAdminServer from "./admin/startAdminServer";
import startGatewayServer from "./gateway/startGatewayServer";
import startProxyServer from "./proxy/startProxyServer";
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
    config.gateway.map(startGatewayServer);
  }
  if (config.proxy) {
    logger.info({ config: config.proxy }, "Start proxy");
    config.proxy.map(startProxyServer);
  }
  if (config.admin) {
    logger.info({ config: config.admin }, "Start admin");
    startAdminServer(config.admin);
  }
}

main();
