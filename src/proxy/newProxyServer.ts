import dequeue from "./dequeue";
import requestHttp from "./requestHttp";
import respond from "./respond";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function newProxyServer({
  gatewayAddress,
  route,
  targetAddress,
}: {
  gatewayAddress: string;
  route: string;
  targetAddress: string;
}) {
  while (true) {
    try {
      const context = await dequeue({ gatewayAddress, route });
      if (context === null) {
        await sleep(500);
        continue;
      }

      const response = await requestHttp({
        url: targetAddress + context.url,
        method: context.method,
        headers: context.headers,
        body: context.body,
      });

      await respond({
        gatewayAddress,
        route,
        context: { ...response, id: context.id },
      });
    } catch (error) {
      console.error("Proxy error", targetAddress, error);
      await sleep(500);
    }
  }
}

function sleep(millis: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, millis));
}
