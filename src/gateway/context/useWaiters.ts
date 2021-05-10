import * as http from "http";

import { nanoid } from "nanoid";

interface Waiter {
  id: string;
  routes: string[];
  req: http.IncomingMessage;
  res: http.ServerResponse;
}

export type UseWaiters = ReturnType<typeof useWaiters>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useWaiters() {
  const waiters: {
    [route: string]: Waiter[];
  } = {};

  function addWaiter({
    routes,
    req,
    res,
  }: {
    routes: string[];
  } & Omit<Waiter, "id">): string {
    const id = nanoid();
    for (const route of routes) {
      if (!(route in waiters)) {
        waiters[route] = [];
      }
      waiters[route].push({ id, req, res, routes });
    }
    return id;
  }

  function dropWaiter(routes: string[], id: string): boolean {
    let deletedCount = 0;
    for (const route of routes) {
      if (!(route in waiters)) {
        continue;
      }
      if (waiters[route].every((w) => w.id !== id)) {
        continue;
      }
      ++deletedCount;
      waiters[route] = waiters[route].filter((w) => w.id !== id);
      if (waiters[route].length === 0) {
        delete waiters[route];
      }
    }
    return routes.length === deletedCount;
  }

  function pollWaiter(route: string): Waiter | null {
    if (!(route in waiters)) {
      return null;
    }
    const maybeWaiter = waiters[route].shift();
    if (!maybeWaiter) {
      return null;
    }
    dropWaiter(
      maybeWaiter.routes.filter((r) => r !== route),
      maybeWaiter.id
    );
    return maybeWaiter;
  }

  return { addWaiter, dropWaiter, pollWaiter };
}
