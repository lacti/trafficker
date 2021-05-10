import * as http from "http";

import { DequeuedContext } from "./dequeue";
import HttpResponse from "../models/HttpResponse";
import { traffickerHeaderKeys } from "../../constants";

export default async function respond({
  context,
  gatewayAddress,
}: {
  context: Omit<DequeuedContext, "url" | "method"> & HttpResponse;
  gatewayAddress: string;
}): Promise<boolean> {
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
        (response) => resolve(response.statusCode === 200)
      )
      .on("error", reject);
    if (context.body) {
      context.body.pipe(request);
    }
  });
}
