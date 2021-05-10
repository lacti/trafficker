import * as http from "http";

import GatewayConfig from "./models/GatewayConfig";
import HttpHandler from "../models/HttpHandler";
import handleDequeueWith from "./handlers/handleDequeueWith";
import handleLogsWith from "./handlers/handleLogsWith";
import handlePendWith from "./handlers/handlePendWith";
import handleRespondWith from "./handlers/handleRespondWith";
import handleStatsWith from "./handlers/handleStatsWith";
import newStatusCodeOnlyHttpHandler from "../support/newStatusCodeOnlyHttpHandler";
import parsePathname from "../support/parsePathname";
import useLogger from "../useLogger";
import useRoutes from "./context/useKnownRoutes";
import useStats from "./context/useStats";
import useWaiters from "./context/useWaiters";
import useWaitings from "./context/useWaitings";

const logger = useLogger({ name: "newGatewayServer" });

export default function newGatewayServer({
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

  const handle500 = newStatusCodeOnlyHttpHandler(500);
  const predefinedHandlers: { [route: string]: HttpHandler } = {
    _dequeue: handleDequeueWith(env),
    _respond: handleRespondWith(env),
    _stat: handleStatsWith(env),
    _log: handleLogsWith(env),
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
      return handle500({ req, res });
    }
  });
}
