import GatewayConfig from "./gatewayConfig";
import HttpContext from "./httpContext";
import { Waiters } from "./useWaiters";
import { Waitings } from "./useWaitings";
import dequeueContextTo from "./dequeueContextTo";
import safeWriteHead from "./safeWriteHead";
import useLogger from "../useLogger";

const logger = useLogger({ name: "processOrPendContext" });

export interface ProcessOrPendContextEnv {
  config: GatewayConfig;
  waitings: Waitings;
  waiters: Waiters;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function processOrPendContextWith({
  config,
  waitings,
  waiters: { pollWaiter },
}: ProcessOrPendContextEnv) {
  const { addWaiting } = waitings;
  const dropIncompletedContext = dropIncompletedContextWith({ waitings });
  return function processOrPendContext({
    route,
    context,
  }: {
    route: string;
    context: HttpContext;
  }): void {
    addWaiting(route, context);

    const maybeWaiter = pollWaiter(route);
    if (maybeWaiter !== null) {
      // Use pending waiter.
      logger.debug({ route, id: context.id }, `Use pending waiter`);
      dequeueContextTo({ route, context, res: maybeWaiter.res });
    } else {
      // Pend context.
      setTimeout(
        () => dropIncompletedContext({ route, id: context.id }),
        config.defaultWaitingTimeout
      );
      logger.debug(
        { id: context.id, method: context.req.method, url: context.req.url },
        `Pending context`
      );
    }
  };
}

function dropIncompletedContextWith({
  waitings: { findWaiting, deleteWaiting },
}: {
  waitings: Pick<Waitings, "findWaiting" | "deleteWaiting">;
}) {
  return function dropIncompletedContext({
    route,
    id,
  }: {
    route: string;
    id: string;
  }) {
    const incompleted = findWaiting(route, id);
    if (incompleted === null || incompleted.processing) {
      return;
    }

    logger.debug(
      {
        id: incompleted.id,
        method: incompleted.req.method,
        url: incompleted.req.url,
        headers: incompleted.req.headers,
      },
      `Delete stale waiting context`
    );
    safeWriteHead({
      res: incompleted.res,
      statusCode: 500,
      logContext: {
        route,
        id,
      },
    });
    deleteWaiting(route, incompleted.id);
  };
}
