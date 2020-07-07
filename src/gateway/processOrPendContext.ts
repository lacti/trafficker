import { GatewayConfig } from "../config";
import HttpContext from "./httpContext";
import dequeueContextTo from "./dequeueContextTo";
import useLogger from "../useLogger";
import useWaiters from "./waiters";
import useWaitings from "./waitings";

const logger = useLogger({ name: "processOrPendContext" });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function processOrPendContext({
  config,
  route,
  context,
}: {
  config: GatewayConfig;
  route: string;
  context: HttpContext;
}) {
  const { addWaiting, findWaiting, deleteWaiting } = useWaitings({ route });
  const { pollWaiter } = useWaiters({ route });

  addWaiting(context);

  const maybeWaiter = pollWaiter();
  if (maybeWaiter !== null) {
    // Use pending waiter.
    logger.debug({ route, id: context.id }, `Use pending waiter`);
    dequeueContextTo({ route, context, res: maybeWaiter.res });
  } else {
    // Pend context.
    setTimeout(() => {
      const incompleted = findWaiting(context.id);
      if (incompleted !== null && incompleted.processing == false) {
        logger.debug(
          {
            id: incompleted.id,
            method: incompleted.req.method,
            url: incompleted.req.url,
            headers: incompleted.req.headers,
          },
          `Delete stale waiting context`
        );
        incompleted.res.writeHead(500).end();
        deleteWaiting(incompleted.id);
      }
    }, config.defaultWaitingTimeout);
    logger.debug(
      { id: context.id, method: context.req.method, url: context.req.url },
      `Pending context`
    );
  }
}
