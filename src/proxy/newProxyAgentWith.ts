import ProxyAgentResult from "./models/ProxyAgentResult";
import ProxyConfig from "./models/ProxyConfig";
import UseProxyStats from "./models/UseProxyStats";
import dequeue from "./support/dequeue";
import requestHttp from "./support/requestHttp";
import respond from "./support/respond";
import serializeRoutes from "../routes/serializeRoutes";
import useLogger from "../useLogger";

const logger = useLogger({ name: "newProxyAgent" });
const knownErrorPatterns = [/ECONNREFUSED/, /socket hang up/];

export default function newProxyAgentWith({
  config,
  stats: { increaseStat },
}: {
  config: ProxyConfig;
  stats: UseProxyStats;
}) {
  const { gatewayAddress, routes, targetAddress } = config;
  if (!routes) {
    throw new Error(`Invalid proxy routes: ${routes}`);
  }
  const serializedRoutes = serializeRoutes(routes);
  return async function proxyAgentMain(): Promise<ProxyAgentResult> {
    try {
      const context = await dequeue({
        gatewayAddress,
        serializedRoutes,
        increaseStat,
      });
      if (context === null) {
        increaseStat("dequeueNoContext");
        logger.trace({}, "No waiting context to serve");
        await randomSleep(
          config.emptySleepMillis.min,
          config.emptySleepMillis.max
        );
        return "NO_CONTEXT";
      }

      logger.trace(
        {
          id: context.id,
          method: context.method,
          url: context.url,
          headers: context.headers,
        },
        "Serve proxy request"
      );
      const response = await requestHttp({
        context: {
          url: targetAddress + context.url,
          method: context.method,
          headers: context.headers,
          body: context.body,
        },
        increaseStat,
      });

      await respond({
        gatewayAddress,
        context: { ...response, id: context.id, route: context.route },
        increaseStat,
      });
      logger.debug(
        {
          route: context.route,
          id: context.id,
          method: context.method,
          url: context.url,
        },
        "Do proxy"
      );
      return "OK";
    } catch (error) {
      if (knownErrorPatterns.some((pattern) => pattern.test(error.message))) {
        increaseStat("proxyKnownError");
        logger.debug({ targetAddress, error }, "Proxy error but known issue");
        await randomSleep(
          config.emptySleepMillis.min,
          config.emptySleepMillis.max
        );
        return "OK";
      }
      increaseStat("proxyUnknownError");
      logger.error({ targetAddress, error }, "Proxy error");
      await randomSleep(
        config.errorSleepMillis.min,
        config.errorSleepMillis.max
      );
      return "ERROR";
    }
  };
}

function randomSleep(min: number, max: number) {
  return sleep(min + Math.random() * (max - min));
}

function sleep(millis: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, millis));
}
