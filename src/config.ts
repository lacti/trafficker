export default interface Config {
  gateway?: {
    port: number;
  };
  proxy?: {
    gatewayAddress: string;
    route: string;
    targetAddress: string;
  };
}
