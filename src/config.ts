export default interface Config {
  gateway?: GatewayConfig[];
  proxy?: ProxyConfig[];
}

export interface GatewayConfig {
  port: number;
  defaultWaitingTimeout: number;
  defaultWaiterTimeout: number;
}

export interface ProxyConfig {
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
