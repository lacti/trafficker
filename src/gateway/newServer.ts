import * as http from "http";

import GatewayConfig from "./gatewayConfig";
import HttpHandler from "./httpHandler";
import handleDequeueWith from "./handleDequeueWith";
import handlePendWith from "./handlePendWith";
import handleRespondWith from "./handleRespondWith";
import parsePathname from "./parsePathname";
import useLogger from "../useLogger";
import useRoutes from "./useRoutes";
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
    routes: useRoutes(),
    waitings: useWaitings(),
    waiters: useWaiters(),
  };
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
      return res.writeHead(500).end();
    }
  });
}
