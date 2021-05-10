import GatewayConfig from "./models/GatewayConfig";
import newGatewayServer from "./newGatewayServer";
import useLogger from "../useLogger";

const logger = useLogger({ name: "startGatewayServer" });

export default function startGatewayServer(config: GatewayConfig) {
  return newGatewayServer({ config }).listen(config.port, () =>
    logger.info({ config }, "Start gateway server")
  );
}
