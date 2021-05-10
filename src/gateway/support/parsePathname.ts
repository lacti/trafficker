import { URL } from "url";

export default function parsePathname(url?: string): string | null {
  if (!url) {
    return null;
  }

  const { pathname } = new URL(url, "resolve://");
  if (!pathname) {
    return null;
  }
  if (pathname.startsWith("/")) {
    return pathname.substring(1);
  }
  return pathname;
}
