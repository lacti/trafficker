export const routeDelimiter = ",";

export default function serializeRoutes(routes: string[]): string {
  return routes
    .filter(Boolean)
    .map((r) => r.trim())
    .filter(Boolean)
    .join(routeDelimiter);
}
