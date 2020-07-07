import * as http from "http";

import { defaultWaiterTimeout, traffickerHeaderKeys } from "../constants";

import dequeueContextTo from "./dequeueContextTo";
import useWaiters from "./waiters";
import useWaitings from "./waitings";

export default function handleDequeue(
  req: http.IncomingMessage,
  res: http.ServerResponse
): void {
  if (req.method?.toLowerCase() !== "post") {
    return res.writeHead(404).end();
  }

  const route = req.headers[traffickerHeaderKeys.route] as string;
  console.info(`Dequeue`, route);

  const context = useWaitings({ route }).pollWaiting();
  console.info(`Dequeue with ctx`, route, context?.id);
  if (context) {
    // Dequeue immediately.
    console.info(`Dequeue immediately`, route, context.id);
    dequeueContextTo(route, context, { res });
  } else {
    // Pend waiter.
    console.info(`Pend waiter`, route);
    const { addWaiter, isStillWaiting, dropWaiter } = useWaiters({ route });
    addWaiter({ route, req, res });

    setTimeout(() => {
      if (isStillWaiting({ req, res })) {
        dropWaiter({ req, res });
        console.info(`No waiting context for`, route);
        return res.writeHead(404).end();
      }
    }, defaultWaiterTimeout);
  }
}
