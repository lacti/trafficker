import ProxyConfig from "./proxyConfig";
import dequeue from "./dequeue";
import requestHttp from "./requestHttp";
import respond from "./respond";
import useLogger from "../useLogger";

const logger = useLogger({ name: "newProxyServer" });
const knownErrorPatterns = [/ECONNREFUSED/, /socket hang up/];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function newProxyServer({
  config,
  gatewayAddress,
  route,
  targetAddress,
}: {
  config: ProxyConfig;
  gatewayAddress: string;
  route: string;
  targetAddress: string;
}) {
  while (true) {
    try {
      const context = await dequeue({ gatewayAddress, route });
      if (context === null) {
        logger.trace(`No waiting context to serve`);
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
        `Serve proxy request`
      );
      const response = await requestHttp({
        url: targetAddress + context.url,
        method: context.method,
        headers: context.headers,
        body: context.body,
      });

      await respond({
        gatewayAddress,
        route,
        context: { ...response, id: context.id },
      });
      logger.info(
        {
          route: route,
          id: context.id,
          method: context.method,
          url: context.url,
        },
        `Do proxy`
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
