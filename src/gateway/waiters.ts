import * as http from "http";

interface Waiter {
  req: http.IncomingMessage;
  res: http.ServerResponse;
}

const waiters: {
  [route: string]: Waiter[];
} = {};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useWaiters({ route }: { route: string }) {
  function addWaiter({
    route,
    req,
    res,
  }: {
    route: string;
  } & Waiter) {
    if (!(route in waiters)) {
      waiters[route] = [];
    }
    waiters[route].push({ req, res });
  }

  function isStillWaiting({ req, res }: Waiter): boolean {
    if (!(route in waiters)) {
      return false;
    }
    return waiters[route].some((w) => w.req === req && w.res === res);
  }

  function dropWaiter({ req, res }: Waiter): void {
    if (!(route in waiters)) {
      return;
    }
    waiters[route] = waiters[route].filter(
      (w) => w.req !== req && w.res !== res
    );
    if (waiters[route].length === 0) {
      delete waiters[route];
    }
  }

  function pollWaiter(): Waiter | null {
    if (!(route in waiters)) {
      return null;
    }
    return waiters[route].shift() ?? null;
  }

  return { addWaiter, isStillWaiting, dropWaiter, pollWaiter };
}
