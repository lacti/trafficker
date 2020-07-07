import HttpContext from "./httpContext";

const waitings: {
  [route: string]: { [id: string]: HttpContext };
} = {};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useWaitings({ route }: { route: string }) {
  function addWaiting(context: HttpContext): HttpContext {
    if (!(route in waitings)) {
      waitings[route] = {};
    }

    waitings[route][context.id] = context;
    return context;
  }

  function deleteWaiting(id: string): void {
    if (route in waitings) {
      if (id in waitings[route]) {
        delete waitings[route][id];
      }
      if (Object.keys(waitings[route]).length === 0) {
        delete waitings[route];
      }
    }
  }

  function pollWaiting(): HttpContext | null {
    if (!(route in waitings)) {
      return null;
    }
    return (
      Object.values(waitings[route]).filter((w) => !w.processing)[0] ?? null
    );
  }

  function findWaiting(id: string): HttpContext | null {
    return route in waitings && id in waitings[route]
      ? waitings[route][id]
      : null;
  }

  return { addWaiting, deleteWaiting, pollWaiting, findWaiting };
}
