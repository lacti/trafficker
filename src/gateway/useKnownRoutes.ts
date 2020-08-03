const anyRoute = "*";

export type KnownRoutes = ReturnType<typeof useKnownRoutes>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useKnownRoutes() {
  let routes: string[] = [];

  function addRoutes(newRoutes: string[]): boolean {
    const next = Array.from(
      new Set([...routes, ...newRoutes.map((r) => r.toLowerCase().trim())])
    );
    routes = next.sort((a, b) =>
      b.length === a.length ? b.localeCompare(a) : b.length - a.length
    );
    return true;
  }

  function hasRoute(route: string): boolean {
    return routes.includes(route.toLowerCase());
  }

  function findRoute(pathname: string): string {
    const lowerPathname = pathname.toLowerCase();
    for (const route of routes) {
      if (lowerPathname.startsWith(route)) {
        return route;
      }
    }
    return anyRoute;
  }

  return { addRoutes, hasRoute, findRoute };
}
