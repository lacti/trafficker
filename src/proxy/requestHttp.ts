import * as http from "http";

import HttpRequest from "./httpRequest";
import HttpResponse from "./httpResponse";

export default function requestHttp(
  context: HttpRequest
): Promise<HttpResponse> {
  return new Promise<HttpResponse>((resolve, reject) => {
    const request = http.request(
      context.url,
      {
        method: context.method,
        headers: context.headers,
      },
      (response) => {
        resolve({
          statusCode: response?.statusCode ?? 400,
          headers: response.headers,
          body: response,
        });
      }
    );
    if (context.body) {
      context.body.pipe(request).on("error", reject);
    } else {
      request.end();
    }
  });
}
