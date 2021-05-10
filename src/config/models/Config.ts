import AdminConfig from "../../admin/models/AdminConfig";
import GatewayConfig from "../../gateway/models/GatewayConfig";
import ProxyConfig from "../../proxy/models/ProxyConfig";

export default interface Config {
  gateway?: GatewayConfig[];
  proxy?: ProxyConfig[];
  admin?: AdminConfig;
}
