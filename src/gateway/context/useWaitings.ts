import HttpContext from "../models/HttpContext";

export type UseWaitings = ReturnType<typeof useWaitings>;

export default function useWaitings() {
  const waitings: {
    [route: string]: { [id: string]: HttpContext };
  } = {};

  function addWaiting(route: string, context: HttpContext): HttpContext {
    if (!(route in waitings)) {
      waitings[route] = {};
    }

    waitings[route][context.id] = context;
    return context;
  }

  function deleteWaiting(route: string, id: string): void {
    if (route in waitings) {
      if (id in waitings[route]) {
        delete waitings[route][id];
      }
      if (Object.keys(waitings[route]).length === 0) {
        delete waitings[route];
      }
    }
  }

  function pollWaiting(route: string): HttpContext | null {
    if (!(route in waitings)) {
      return null;
    }
    return (
      Object.values(waitings[route]).filter((w) => !w.processing)[0] ?? null
    );
  }

  function findWaiting(route: string, id: string): HttpContext | null {
    return route in waitings && id in waitings[route]
      ? waitings[route][id]
      : null;
  }

  return { addWaiting, deleteWaiting, pollWaiting, findWaiting };
}
