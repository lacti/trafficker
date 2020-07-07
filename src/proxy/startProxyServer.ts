import { ProxyConfig } from "../config";
import newProxyServer from "./newProxyServer";
import useLogger from "../useLogger";
import useRoutes from "../gateway/routes";

const logger = useLogger({ name: "startServer" });
const routes = useRoutes();

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function startProxyServer(config: ProxyConfig) {
  if (!routes.addRoute(config.route)) {
    throw new Error("Duplicated route: " + config.route);
  }
  const agentCount = config.agentCount;
  const { route, gatewayAddress, targetAddress } = config;
  return Promise.all(
    Array(agentCount)
      .fill(0)
      .map(() =>
        newProxyServer({
          config,
          route,
          gatewayAddress,
          targetAddress,
        }).catch((error) =>
          logger.error(
            { route, gatewayAddress, targetAddress, error },
            "Error in proxyServer"
          )
        )
      )
  );
}
