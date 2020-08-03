export default interface ProxyConfig {
  gatewayAddress: string;
  route: string;
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
}
