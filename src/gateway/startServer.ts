import { GatewayConfig } from "../config";
import newServer from "./newServer";
import useLogger from "../useLogger";

const logger = useLogger({ name: "startServer" });

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function startServer(config: GatewayConfig) {
  return newServer({ config }).listen(config.port, () =>
    logger.info(`Listen on ${config.port}`)
  );
}
