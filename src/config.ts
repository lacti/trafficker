import * as fs from "fs";

import GatewayConfig from "./gateway/gatewayConfig";
import ProxyConfig from "./proxy/proxyConfig";

export interface Config {
  gateway?: GatewayConfig[];
  proxy?: ProxyConfig[];
}

export function loadConfig(configPath: string): Config {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}
