import GatewayConfig from "../../gateway/models/GatewayConfig";
import ProxyConfig from "../../proxy/proxyConfig";

export default interface Config {
  gateway?: GatewayConfig[];
  proxy?: ProxyConfig[];
}
