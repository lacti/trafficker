import { IncreaseStat, UseStats } from "./useStats";

import GatewayConfig from "../models/GatewayConfig";
import HttpContext from "../models/HttpContext";
import { UseWaiters } from "./useWaiters";
import { UseWaitings } from "./useWaitings";
import dequeueContextTo from "./dequeueContextTo";
import responseSafeWriteHead from "../support/responseSafeWriteHead";
import useLogger from "../../useLogger";

const logger = useLogger({ name: "processOrPendContext" });

export interface ProcessOrPendContextEnv {
  config: GatewayConfig;
  waitings: UseWaitings;
  waiters: UseWaiters;
  stats: UseStats;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function processOrPendContextWith({
  config,
  waitings,
  waiters: { pollWaiter },
  stats: { increaseStat },
}: ProcessOrPendContextEnv) {
  const { addWaiting } = waitings;
  const dropIncompletedContext = dropIncompletedContextWith({
    waitings,
    increaseStat,
  });
  return function processOrPendContext({
    route,
    context,
  }: {
    route: string;
    context: HttpContext;
  }): void {
    increaseStat("processOrPendAddWaiting");
    addWaiting(route, context);

    const maybeWaiter = pollWaiter(route);
    if (maybeWaiter !== null) {
      // Use pending waiter.
      increaseStat("processOrPendDequeueImmediately");
      logger.debug({ route, id: context.id }, "Use pending waiter");
      dequeueContextTo({ route, context, res: maybeWaiter.res, increaseStat });
    } else {
      // Pend context.
      setTimeout(
        () => dropIncompletedContext({ route, id: context.id }),
        config.defaultWaitingTimeout
      );
      logger.debug(
        { id: context.id, method: context.req.method, url: context.req.url },
        "Pending context"
      );
    }
  };
}

function dropIncompletedContextWith({
  waitings: { findWaiting, deleteWaiting },
  increaseStat,
}: {
  waitings: Pick<UseWaitings, "findWaiting" | "deleteWaiting">;
  increaseStat: IncreaseStat;
}) {
  return function dropIncompletedContext({
    route,
    id,
  }: {
    route: string;
    id: string;
  }) {
    increaseStat("dropIncompletedContextTimeoutFired");
    const incompleted = findWaiting(route, id);
    if (incompleted === null || incompleted.processing) {
      increaseStat("dropIncompletedContextAlreadyProcessed");
      return;
    }

    increaseStat("dropIncompletedContextDropped");
    logger.debug(
      {
        id: incompleted.id,
        method: incompleted.req.method,
        url: incompleted.req.url,
        headers: incompleted.req.headers,
      },
      "Delete stale waiting context"
    );
    responseSafeWriteHead({
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
