import ProxyConfig from "./models/ProxyConfig";
import ProxyStats from "./models/ProxyStats";
import newProxyAgentWith from "./newProxyAgentWith";
import { newProxyStats } from "./models/ProxyStats";
import startStatServer from "../stats/startStatServer";
import useLogger from "../useLogger";
import useStats from "../stats/useStats";

const logger = useLogger({ name: "startProxyAgents" });

export default function startProxyAgents(config: ProxyConfig) {
  const { agentCount, maxAgentCount = 1024, stat } = config;
  const stats = useStats<ProxyStats>({ newStats: newProxyStats });
  if (stat) {
    startStatServer({ config: stat, stats });
  }

  let agentCurrentCount = 0;
  let agentIdSerial = 0;
  const proxyAgentMain = newProxyAgentWith({ config, stats });

  const { increaseStat, updateStat } = stats;
  function spawnNewAgent() {
    if (agentCurrentCount >= maxAgentCount) {
      increaseStat("agentTooManyToSpawn");
      return;
    }
    increaseStat("agentSpawnNew");
    ++agentCurrentCount;
    updateStat("agentCurrentCount", agentCurrentCount);

    const agentId = ++agentIdSerial;
    logger.debug({ agentId, agentCurrentCount }, "Spawn new agent");

    proxyAgentMain()
      .then((result) => {
        increaseStat("agentCompleted");
        --agentCurrentCount;
        updateStat("agentCurrentCount", agentCurrentCount);

        logger.debug({ agentId, result }, "Agent is completed");
        switch (result) {
          case "OK":
            increaseStat("agentCompletedOK");
            logger.debug({ agentId, result }, "Spawn 1 more agent");
            spawnNewAgent();
            spawnNewAgent();
            break;
          case "NO_CONTEXT":
          case "ERROR":
            increaseStat(
              result === "NO_CONTEXT"
                ? "agentCompletedNoContext"
                : "agentCompletedError"
            );
            if (agentCurrentCount < agentCount) {
              logger.debug(
                { agentId, result },
                "Spawn next agent for minimum count"
              );
              spawnNewAgent();
            }
            break;
        }
      })
      .catch((error) => {
        increaseStat("agentError");
        logger.error({ agentId }, "Agent has error");
        if (agentCurrentCount < agentCount) {
          logger.debug(
            { agentId, result: "ERROR_CATCH", error },
            "Spawn next agent for minimum count"
          );
          spawnNewAgent();
        }
      });
  }

  Array(agentCount)
    .fill(0)
    .forEach(() => spawnNewAgent());
}
