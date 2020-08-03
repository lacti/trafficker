import * as http from "http";

import GatewayConfig from "./gatewayConfig";
import HttpHandler from "./httpHandler";
import { Waiters } from "./useWaiters";
import { Waitings } from "./useWaitings";
import dequeueContextTo from "./dequeueContextTo";
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
  waiters: { addWaiter, isStillWaiting, dropWaiter },
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
      return res.writeHead(404).end();
    }

    const route = req.headers[traffickerHeaderKeys.route] as string;
    logger.debug({ route }, `Dequeue`);

    const context = pollWaiting(route);
    logger.debug({ route, id: context?.id }, `Dequeue with ctx`);
    if (context) {
      // Dequeue immediately.
      logger.debug({ route, id: context.id }, `Dequeue immediately`);
      dequeueContextTo({ route, context, res });
    } else {
      // Pend waiter.
      logger.debug({ route }, `Pend waiter`);
      const waiterId = addWaiter({ route, req, res });

      setTimeout(() => {
        if (isStillWaiting(route, waiterId)) {
          dropWaiter(route, waiterId);
          logger.debug({ route }, `No waiting context for`);
          return res.writeHead(404).end();
        }
      }, config.defaultWaiterTimeout);
    }
  };
}
