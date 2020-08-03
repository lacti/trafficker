export type Routes = ReturnType<typeof useRoutes>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useRoutes() {
  let routes: string[] = [];

  function addRoute(route: string): boolean {
    if (hasRoute(route)) {
      return false;
    }
    routes = [...routes, route.toLowerCase()];
    return true;
  }

  function hasRoute(route: string): boolean {
    return routes.includes(route.toLowerCase());
  }

  function removeRoute(route: string): boolean {
    if (!hasRoute(route)) {
      return false;
    }
    const loRoute = route.toLowerCase();
    routes = routes.filter((each) => each !== loRoute);
    return true;
  }

  return { addRoute, hasRoute, removeRoute };
}
