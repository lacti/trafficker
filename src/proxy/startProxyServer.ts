import ProxyConfig from "./models/ProxyConfig";
import ProxyStats from "./models/ProxyStats";
import newProxyServer from "./newProxyServer";
import { newProxyStats } from "./models/ProxyStats";
import startStatServer from "../stats/startStatServer";
import useLogger from "../useLogger";
import useStats from "../stats/useStats";

const logger = useLogger({ name: "startProxyServer" });

export default function startProxyServer(config: ProxyConfig) {
  const { agentCount, stat } = config;
  const stats = useStats<ProxyStats>({ newStats: newProxyStats });
  if (stat) {
    startStatServer({ config: stat, stats });
  }
  return Promise.all(
    Array(agentCount)
      .fill(0)
      .map(() =>
        newProxyServer({
          config,
          stats,
        }).catch((error) =>
          logger.error({ config, error }, "Error in proxyServer")
        )
      )
  );
}
