import {MashroomGraphQLPluginBootstrapFunction} from "../../../../type-definitions";
import TestGraphQLRemotePlugin from "./TestGraphQLRemotePlugin";

const bootstrap: MashroomGraphQLPluginBootstrapFunction = (pluginName, config, contextHolder, pubSub) => {
  return Promise.resolve(new TestGraphQLRemotePlugin());
}

export default bootstrap;
