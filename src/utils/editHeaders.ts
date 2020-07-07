import { traffickerHeaderKeys } from "../constants";

type Headers = { [key: string]: string | string[] | undefined };

export function addPrefixToHeaders(headers: Headers): Headers {
  const newHeaders: Headers = {};
  for (const [key, value] of Object.entries(headers)) {
    if (key === undefined) {
      continue;
    }
    newHeaders[`${traffickerHeaderKeys.headerKeyPrefix}${key}`] = value;
  }
  return newHeaders;
}

export function removePrefixFromHeaders(prefixedHeaders: Headers): Headers {
  const unprefixedHeaders: Headers = {};
  for (const [key, value] of Object.entries(prefixedHeaders)) {
    if (key === undefined) {
      continue;
    }
    if (!key.startsWith(traffickerHeaderKeys.headerKeyPrefix)) {
      continue;
    }
    const properKey = key.substring(
      traffickerHeaderKeys.headerKeyPrefix.length
    );
    if (!properKey) {
      continue;
    }

    unprefixedHeaders[properKey] = value;
  }
  return unprefixedHeaders;
}
