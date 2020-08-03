import * as http from "http";

import GatewayConfig from "./gatewayConfig";
import HttpHandler from "./httpHandler";
import { Waiters } from "./useWaiters";
import { Waitings } from "./useWaitings";
import dequeueContextTo from "./dequeueContextTo";
import deserializeRoutes from "../routes/deserializeRoutes";
import safeWriteHead from "./safeWriteHead";
import { traffickerHeaderKeys } from "../constants";
import useLogger from "../useLogger";

const logger = useLogger({ name: "handleDequeue" });

export interface HandleDequeueEnv {
  config: GatewayConfig;
  waiters: Waiters;
  waitings: Waitings;
}

export default function handleDequeueWith({
  config,
  waiters: { addWaiter, dropWaiter },
  waitings: { pollWaiting },
}: HandleDequeueEnv): HttpHandler {
  return function ({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): void {
    if (req.method?.toLowerCase() !== "post") {
      return safeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }

    const routes = deserializeRoutes(
      req.headers[traffickerHeaderKeys.route] as string
    );
    logger.debug({ routes }, `Dequeue`);
    if (routes.length === 0) {
      return safeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }

    // Dequeue immediately.
    for (const route of routes) {
      const context = pollWaiting(route);
      logger.debug({ route, id: context?.id }, `Dequeue with ctx`);
      if (context) {
        logger.debug({ route, id: context.id }, `Dequeue immediately`);
        dequeueContextTo({ route, context, res });
        return;
      }
    }

    // Pend waiter.
    logger.debug({ routes }, `Pend waiter`);
    const waiterId = addWaiter({ routes, req, res });

    setTimeout(() => {
      if (dropWaiter(routes, waiterId)) {
        logger.debug({ routes }, `No waiting context for`);
        safeWriteHead({ res, statusCode: 404, logContext: { url: req.url } });
      }
    }, config.defaultWaiterTimeout);
  };
}
