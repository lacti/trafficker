import * as http from "http";

import { DequeuedContext } from "./dequeue";
import HttpResponse from "../models/HttpResponse";
import IncreaseProxyStat from "../models/IncreaseProxyStat";
import { traffickerHeaderKeys } from "../../constants";

export default async function respond({
  context,
  gatewayAddress,
  increaseStat,
}: {
  context: Omit<DequeuedContext, "url" | "method"> & HttpResponse;
  gatewayAddress: string;
  increaseStat: IncreaseProxyStat;
}): Promise<boolean> {
  increaseStat("respondStart");
  return new Promise<boolean>((resolve, reject) => {
    const request = http
      .request(
        `${gatewayAddress}/_respond`,
        {
          method: "POST",
          headers: {
            [traffickerHeaderKeys.id]: context.id,
            [traffickerHeaderKeys.statusCode]: context.statusCode,
            [traffickerHeaderKeys.route]: context.route,
            [traffickerHeaderKeys.header]: JSON.stringify(context.headers),
          },
        },
        (response) => {
          if (response.statusCode === 200) {
            increaseStat("respond200");
            resolve(true);
          } else {
            increaseStat("respondOthers");
          }
        }
      )
      .on("error", (error) => {
        increaseStat("respondError");
        reject(error);
      });

    if (context.body) {
      context.body
        .pipe(request)
        .on("error", (error) => {
          increaseStat("respondBodyPipeError");
          reject(error);
        })
        .on("close", () => {
          increaseStat("respondBodyPipeClose");
        });
    } else {
      request.end();
      increaseStat("respondNoBody");
    }
  });
}
