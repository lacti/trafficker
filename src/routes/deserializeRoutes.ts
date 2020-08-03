import { routeDelimiter } from "./serializeRoutes";

export default function deserializeRoutes(serialized: string): string[] {
  return (serialized ? serialized.split(routeDelimiter) : [])
    .map((r) => r.trim())
    .filter(Boolean);
}
