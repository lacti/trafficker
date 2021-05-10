import * as http from "http";

import GatewayConfig from "../models/GatewayConfig";
import HttpHandler from "../models/HttpHandler";
import { UseStats } from "../context/useStats";
import { UseWaiters } from "../context/useWaiters";
import { UseWaitings } from "../context/useWaitings";
import dequeueContextTo from "../context/dequeueContextTo";
import deserializeRoutes from "../../routes/deserializeRoutes";
import responseSafeWriteHead from "../support/responseSafeWriteHead";
import { traffickerHeaderKeys } from "../../constants";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "handleDequeue" });

export interface HandleDequeueEnv {
  config: GatewayConfig;
  waiters: UseWaiters;
  waitings: UseWaitings;
  stats: UseStats;
}

export default function handleDequeueWith({
  config,
  waiters: { addWaiter, dropWaiter },
  waitings: { pollWaiting },
  stats: { increaseStat },
}: HandleDequeueEnv): HttpHandler {
  return function ({
    req,
    res,
  }: {
    req: http.IncomingMessage;
    res: http.ServerResponse;
  }): void {
    if (req.method?.toLowerCase() !== "post") {
      increaseStat("dequeueInvalidRequest");
      return responseSafeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }

    increaseStat("dequeueStart");
    const routes = deserializeRoutes(
      req.headers[traffickerHeaderKeys.route] as string
    );
    logger.debug({ routes }, "Dequeue");
    if (routes.length === 0) {
      increaseStat("dequeueNoRoute");
      return responseSafeWriteHead({
        res,
        statusCode: 404,
        logContext: { url: req.url },
      });
    }

    // Dequeue immediately.
    for (const route of routes) {
      const context = pollWaiting(route);
      logger.debug({ route, id: context?.id }, "Dequeue with ctx");
      if (context) {
        increaseStat("dequeueImmediately");
        logger.debug({ route, id: context.id }, "Dequeue immediately");
        dequeueContextTo({ route, context, res, increaseStat });
        return;
      }
    }

    // Pend waiter.
    increaseStat("dequeuePendWaiter");
    logger.debug({ routes }, "Pend waiter");
    const waiterId = addWaiter({ routes, req, res });

    setTimeout(() => {
      increaseStat("dequeueWaiterTimeoutFired");
      if (dropWaiter(routes, waiterId)) {
        increaseStat("dequeueWaiterDropped");
        logger.debug({ routes, waiterId }, "No waiting context for");
        responseSafeWriteHead({
          res,
          statusCode: 404,
          logContext: { url: req.url },
        });
      }
    }, config.defaultWaiterTimeout);
  };
}
