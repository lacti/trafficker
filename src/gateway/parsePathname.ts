import { parse as parseURL } from "url";

export default function parsePathname(url?: string): string | null {
  if (!url) {
    return null;
  }
  const { pathname } = parseURL(url);
  if (!pathname) {
    return null;
  }
  if (pathname.startsWith("/")) {
    return pathname.substring(1);
  }
  return pathname;
}
