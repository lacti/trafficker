import AdminConfig from "./models/AdminConfig";
import newAdminServer from "./newAdminServer";
import useLogger from "../useLogger";

const logger = useLogger({ name: "startAdminServer" });

export default function startAdminServer(config: AdminConfig) {
  return newAdminServer({ config }).listen(config.port, () =>
    logger.info({ config }, "Start admin server")
  );
}
