import StatConfig from "../../stats/models/StatConfig";
export default interface ProxyConfig {
  gatewayAddress: string;
  routes: string[];
  targetAddress: string;
  agentCount: number;
  errorSleepMillis: {
    min: number;
    max: number;
  };
  emptySleepMillis: {
    min: number;
    max: number;
  };
  stat?: StatConfig;
}
