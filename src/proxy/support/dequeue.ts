import * as http from "http";

import HttpRequest from "../models/HttpRequest";
import IncreaseProxyStat from "../models/IncreaseProxyStat";
import { traffickerHeaderKeys } from "../../constants";

export interface DequeuedContext extends HttpRequest {
  id: string;
  route: string;
}

export default async function dequeue({
  gatewayAddress,
  serializedRoutes,
  increaseStat,
}: {
  gatewayAddress: string;
  serializedRoutes: string;
  increaseStat: IncreaseProxyStat;
}): Promise<DequeuedContext | null> {
  increaseStat("dequeueStart");
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
              increaseStat("dequeue200");
              return resolve(handleDequeueResponse(response));
            case 404:
              increaseStat("dequeue404");
              return resolve(null);
            default:
              increaseStat("dequeueOthers");
              return reject(
                new Error(`${response.statusCode} ${response.statusMessage}`)
              );
          }
        }
      )
      .on("error", (error) => {
        increaseStat("dequeueError");
        reject(error);
      })
      .end()
  );
}

function handleDequeueResponse(res: http.IncomingMessage): DequeuedContext {
  return {
    id: res.headers[traffickerHeaderKeys.id] as string,
    route: res.headers[traffickerHeaderKeys.route] as string,
    url: res.headers[traffickerHeaderKeys.url] as string,
    method: res.headers[traffickerHeaderKeys.method] as string,
    headers: JSON.parse(
      (res.headers[traffickerHeaderKeys.header] as string) ?? "{}"
    ),
    body: res,
  };
}
