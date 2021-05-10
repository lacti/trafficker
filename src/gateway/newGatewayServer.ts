import * as http from "http";

import GatewayConfig from "./models/GatewayConfig";
import GatewayStats from "./models/GatewayStats";
import HttpHandler from "../models/HttpHandler";
import handleDequeueWith from "./handlers/handleDequeueWith";
import handlePendWith from "./handlers/handlePendWith";
import handleRespondWith from "./handlers/handleRespondWith";
import handleStatsWith from "../stats/handlers/handleStatsWith";
import { newGatewayStats } from "./models/GatewayStats";
import parsePathname from "../support/parsePathname";
import statusCodeOnlyHandlers from "../support/statusCodeOnlyHandlers";
import useLogger from "../useLogger";
import useRoutes from "./context/useKnownRoutes";
import useStats from "../stats/useStats";
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
    stats: useStats<GatewayStats>({ newStats: newGatewayStats }),
  };
  if (config.knownRoutes) {
    env.knownRoutes.addRoutes(config.knownRoutes);
  }

  const predefinedHandlers: { [route: string]: HttpHandler } = {
    _dequeue: handleDequeueWith(env),
    _respond: handleRespondWith(env),
    _stat: config.stat
      ? handleStatsWith<GatewayStats>(env)
      : statusCodeOnlyHandlers.$404,
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
      return statusCodeOnlyHandlers.$500({ req, res });
    }
  });
}
