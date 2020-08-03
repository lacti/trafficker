import * as http from "http";

import HttpRequest from "./httpRequest";
import { removePrefixFromHeaders } from "../utils/editHeaders";
import { traffickerHeaderKeys } from "../constants";

export interface DequeuedContext extends HttpRequest {
  id: string;
  route: string;
}

export default async function dequeue({
  gatewayAddress,
  serializedRoutes,
}: {
  gatewayAddress: string;
  serializedRoutes: string;
}): Promise<DequeuedContext | null> {
  return new Promise<DequeuedContext | null>((resolve, reject) =>
    http
      .request(
        `${gatewayAddress}/_dequeue`,
        {
          method: "POST",
          headers: {
            [traffickerHeaderKeys.route]: serializedRoutes,
          },
        },
        (response) => {
          switch (response.statusCode ?? 404) {
            case 200:
              return resolve(handleDequeueResponse(response));
            case 404:
              return resolve(null);
            default:
              return reject(
                new Error(`${response.statusCode} ${response.statusMessage}`)
              );
          }
        }
      )
      .on("error", reject)
      .end()
  );
}

function handleDequeueResponse(res: http.IncomingMessage): DequeuedContext {
  return {
    id: res.headers[traffickerHeaderKeys.id] as string,
    route: res.headers[traffickerHeaderKeys.route] as string,
    url: res.headers[traffickerHeaderKeys.url] as string,
    method: res.headers[traffickerHeaderKeys.method] as string,
    headers: removePrefixFromHeaders(res.headers),
    body: res,
  };
}
