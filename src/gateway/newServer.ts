import * as http from "http";

import GatewayConfig from "./gatewayConfig";
import HttpHandler from "./httpHandler";
import handleDequeueWith from "./handleDequeueWith";
import handlePendWith from "./handlePendWith";
import handleRespondWith from "./handleRespondWith";
import parsePathname from "./parsePathname";
import safeWriteHead from "./safeWriteHead";
import useLogger from "../useLogger";
import useRoutes from "./useKnownRoutes";
import useWaiters from "./useWaiters";
import useWaitings from "./useWaitings";

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
  };
  if (config.knownRoutes) {
    env.knownRoutes.addRoutes(config.knownRoutes);
  }

  const handleDequeue = handleDequeueWith(env);
  const handleRespond = handleRespondWith(env);
  const handlePend = handlePendWith(env);

  function route(pathname: string): HttpHandler {
    logger.trace({ pathname }, `pathname`);
    if (pathname.startsWith("_")) {
      switch (pathname) {
        case "_dequeue":
          return handleDequeue;
        case "_respond":
          return handleRespond;
      }
    }
    return handlePend;
  }

  const { serverName } = config;
  return http.createServer(async (req, res) => {
    const requestHost = req.headers["host"];
    if (serverName !== undefined && serverName !== requestHost) {
      logger.trace(
        { serverName, requestHost },
        "Server name is mismatched, just dropped"
      );
      return;
    }

    try {
      route(parsePathname(req.url) ?? "")({ req, res });
    } catch (error) {
      logger.warn({ req, error }, "Error in http handler");
      return safeWriteHead({
        res,
        statusCode: 500,
        logContext: { url: req.url },
      });
    }
  });
}
