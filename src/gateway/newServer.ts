import * as http from "http";

import GatewayConfig from "./models/GatewayConfig";
import HttpHandler from "./models/HttpHandler";
import handleConfigWith from "./handlers/handleConfigWith";
import handleDequeueWith from "./handlers/handleDequeueWith";
import handleLogsWith from "./handlers/handleLogsWith";
import handlePendWith from "./handlers/handlePendWith";
import handleRespondWith from "./handlers/handleRespondWith";
import handleShutdownWith from "./handlers/handleShutdownWith";
import handleStatsWith from "./handlers/handleStatsWith";
import parsePathname from "./support/parsePathname";
import responseSafeWriteHead from "./support/responseSafeWriteHead";
import useLogger from "../useLogger";
import useRoutes from "./context/useKnownRoutes";
import useStats from "./context/useStats";
import useWaiters from "./context/useWaiters";
import useWaitings from "./context/useWaitings";

const logger = useLogger({ name: "newServer" });

export default function newServer({
  config,
}: {
  config: GatewayConfig;
}): http.Server {
  const env = {
    config,
    knownRoutes: useRoutes(),
    waitings: useWaitings(),
    waiters: useWaiters(),
    stats: useStats(),
  };
  if (config.knownRoutes) {
    env.knownRoutes.addRoutes(config.knownRoutes);
  }

  const predefinedHandlers: { [route: string]: HttpHandler } = {
    _dequeue: handleDequeueWith(env),
    _respond: handleRespondWith(env),
    _stat: handleStatsWith(env),
    _log: handleLogsWith(env),
    _shutdown: handleShutdownWith(env),
    _config: handleConfigWith(env),
  };

  const handlePend = handlePendWith(env);
  function route(pathname: string): HttpHandler {
    logger.trace({ pathname }, "Start routing");
    if (pathname in predefinedHandlers) {
      return predefinedHandlers[pathname];
    }
    return handlePend;
  }

  return http.createServer(async (req, res) => {
    try {
      route(parsePathname(req.url) ?? "")({ req, res });
    } catch (error) {
      logger.warn({ req, error }, "Error in http handler");
      return responseSafeWriteHead({
        res,
        statusCode: 500,
        logContext: { url: req.url },
      });
    }
  });
}
