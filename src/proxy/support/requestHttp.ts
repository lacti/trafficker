import * as http from "http";

import HttpRequest from "../models/HttpRequest";
import HttpResponse from "../models/HttpResponse";
import IncreaseProxyStat from "../models/IncreaseProxyStat";

export default function requestHttp({
  context,
  increaseStat,
}: {
  context: HttpRequest;
  increaseStat: IncreaseProxyStat;
}): Promise<HttpResponse> {
  increaseStat("requestHttpStart");
  return new Promise<HttpResponse>((resolve, reject) => {
    const request = http.request(
      context.url,
      {
        method: context.method,
        headers: context.headers,
      },
      (response) => {
        increaseStat("requestHttpReceived");
        resolve({
          statusCode: response?.statusCode ?? 400,
          headers: response.headers,
          body: response,
        });
      }
    );
    if (context.body) {
      context.body
        .pipe(request)
        .on("error", (error) => {
          increaseStat("requestHttpBodyPipeError");
          reject(error);
        })
        .on("close", () => {
          increaseStat("requestHttpBodyPipeClose");
        });
    } else {
      request.end();
      increaseStat("requestHttpNoBody");
    }
  });
}
