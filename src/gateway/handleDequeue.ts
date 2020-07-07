import * as http from "http";

import { GatewayConfig } from "../config";
import dequeueContextTo from "./dequeueContextTo";
import { traffickerHeaderKeys } from "../constants";
import useLogger from "../useLogger";
import useWaiters from "./waiters";
import useWaitings from "./waitings";

const logger = useLogger({ name: "handleDequeue" });

export default function handleDequeue({
  config,
  req,
  res,
}: {
  config: GatewayConfig;
  req: http.IncomingMessage;
  res: http.ServerResponse;
}): void {
  if (req.method?.toLowerCase() !== "post") {
    return res.writeHead(404).end();
  }

  const route = req.headers[traffickerHeaderKeys.route] as string;
  logger.debug({ route }, `Dequeue`);

  const context = useWaitings({ route }).pollWaiting();
  logger.debug({ route, id: context?.id }, `Dequeue with ctx`);
  if (context) {
    // Dequeue immediately.
    logger.debug({ route, id: context.id }, `Dequeue immediately`);
    dequeueContextTo({ route, context, res });
  } else {
    // Pend waiter.
    logger.debug({ route }, `Pend waiter`);
    const { addWaiter, isStillWaiting, dropWaiter } = useWaiters({ route });
    const waiterId = addWaiter({ route, req, res });

    setTimeout(() => {
      if (isStillWaiting(waiterId)) {
        dropWaiter(waiterId);
        logger.debug({ route }, `No waiting context for`);
        return res.writeHead(404).end();
      }
    }, config.defaultWaiterTimeout);
  }
}
