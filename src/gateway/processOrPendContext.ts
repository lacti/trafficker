import HttpContext from "./httpContext";
import { defaultWaitingTimeout } from "../constants";
import dequeueContextTo from "./dequeueContextTo";
import useWaiters from "./waiters";
import useWaitings from "./waitings";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function processOrPendContext(
  route: string,
  context: HttpContext
) {
  const { addWaiting, findWaiting, deleteWaiting } = useWaitings({ route });
  const { pollWaiter } = useWaiters({ route });

  addWaiting(context);

  const maybeWaiter = pollWaiter();
  if (maybeWaiter !== null) {
    // Use pending waiter.
    console.info(`Use pending waiter`, route, context.id);
    dequeueContextTo(route, context, maybeWaiter);
  } else {
    // Pend context.
    setTimeout(() => {
      const incompleted = findWaiting(context.id);
      if (incompleted !== null && incompleted.processing == false) {
        console.info(
          `Delete stale waiting context`,
          incompleted.id,
          incompleted.req.method,
          incompleted.req.url,
          incompleted.req.headers
        );
        incompleted.res.writeHead(500).end();
        deleteWaiting(incompleted.id);
      }
    }, defaultWaitingTimeout);
    console.info(
      `Pending context`,
      context.id,
      context.req.method,
      context.req.url
    );
  }
}
