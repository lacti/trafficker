import BaseStats from "./models/BaseStats";
import StatConfig from "./models/StatConfig";
import { UseStats } from "./useStats";
import newStatServer from "./newStatServer";
import useLogger from "../useLogger";

const logger = useLogger({ name: "startStatServer" });

export default function startStatServer<S extends BaseStats<S>>({
  config,
  stats,
}: {
  config: StatConfig;
  stats: UseStats<S>;
}) {
  return newStatServer({ stats }).listen(config.port, () =>
    logger.info({ config }, "Start stat server")
  );
}
