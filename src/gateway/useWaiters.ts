import * as http from "http";

import { nanoid } from "nanoid";

interface Waiter {
  id: string;
  req: http.IncomingMessage;
  res: http.ServerResponse;
}

export type Waiters = ReturnType<typeof useWaiters>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useWaiters() {
  const waiters: {
    [route: string]: Waiter[];
  } = {};

  function addWaiter({
    route,
    req,
    res,
  }: {
    route: string;
  } & Omit<Waiter, "id">): string {
    if (!(route in waiters)) {
      waiters[route] = [];
    }
    const id = nanoid();
    waiters[route].push({ id, req, res });
    return id;
  }

  function isStillWaiting(route: string, id: string): boolean {
    if (!(route in waiters)) {
      return false;
    }
    return waiters[route].some((w) => w.id === id);
  }

  function dropWaiter(route: string, id: string): void {
    if (!(route in waiters)) {
      return;
    }
    waiters[route] = waiters[route].filter((w) => w.id !== id);
    if (waiters[route].length === 0) {
      delete waiters[route];
    }
  }

  function pollWaiter(route: string): Waiter | null {
    if (!(route in waiters)) {
      return null;
    }
    return waiters[route].shift() ?? null;
  }

  return { addWaiter, isStillWaiting, dropWaiter, pollWaiter };
}
