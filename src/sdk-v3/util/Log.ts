import { ILogger } from "./log/ILogger";
import { ExploreLogger } from "./log/ExploreLogger";
import { NodeLogger } from "./log/NodeLogger";

export { ILogger, ExploreLogger, NodeLogger };

export let level: string = "TRACE";

export function $getLogger(nodeEnv: boolean, level: string): ILogger {
  if (nodeEnv) {
    return new NodeLogger(level);
  } else {
    return new ExploreLogger(level);
  }
}

export function getLogger(): ILogger {
  return $getLogger(typeof XMLHttpRequest === "undefined", level);
}

export function setLevel(_level: string) {
  level = _level;
}



