import * as fs from "fs";

import Config from "./config";
import newProxyServer from "./proxy/newProxyServer";
import newServer from "./gateway/newServer";
import useRoutes from "./gateway/routes";

function main() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.info(process.argv[0], process.argv[1], "config-file-path");
    return;
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as Config;
  if (config.gateway) {
    newServer().listen(config.gateway.port, () =>
      console.info(`Listen on ${config.gateway!.port}`)
    );
  }

  if (config.proxy) {
    useRoutes().addRoute(config.proxy.route);
    newProxyServer({
      gatewayAddress: config.proxy.gatewayAddress,
      targetAddress: config.proxy.targetAddress,
      route: config.proxy.route,
    }).catch(console.error);
  }
}

main();
