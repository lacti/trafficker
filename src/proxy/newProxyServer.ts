import ProxyConfig from "./models/ProxyConfig";
import dequeue from "./support/dequeue";
import requestHttp from "./support/requestHttp";
import respond from "./support/respond";
import serializeRoutes from "../routes/serializeRoutes";
import useLogger from "../useLogger";

const logger = useLogger({ name: "newProxyServer" });
const knownErrorPatterns = [/ECONNREFUSED/, /socket hang up/];

export default async function newProxyServer({
  config,
}: {
  config: ProxyConfig;
}) {
  const { gatewayAddress, routes, targetAddress } = config;
  if (!routes) {
    throw new Error(`Invalid proxy routes: ${routes}`);
  }
  const serializedRoutes = serializeRoutes(routes);

  while (true) {
    try {
      const context = await dequeue({ gatewayAddress, serializedRoutes });
      if (context === null) {
        logger.trace({}, "No waiting context to serve");
        await randomSleep(
          config.emptySleepMillis.min,
          config.emptySleepMillis.max
        );
        continue;
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
        url: targetAddress + context.url,
        method: context.method,
        headers: context.headers,
        body: context.body,
      });

      await respond({
        gatewayAddress,
        context: { ...response, id: context.id, route: context.route },
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
    } catch (error) {
      if (knownErrorPatterns.some((pattern) => pattern.test(error.message))) {
        logger.debug({ targetAddress, error }, "Proxy error but known issue");
      } else {
        logger.error({ targetAddress, error }, "Proxy error");
      }
      await randomSleep(
        config.errorSleepMillis.min,
        config.errorSleepMillis.max
      );
    }
  }
}

function randomSleep(min: number, max: number) {
  return sleep(min + Math.random() * (max - min));
}

function sleep(millis: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, millis));
}
