import {MashroomGraphQLPluginBootstrapFunction} from "../../../../type-definitions";
import TestGraphQLPlugin from "./TestGraphQLPlugin";

const bootstrap: MashroomGraphQLPluginBootstrapFunction = (pluginName, config, contextHolder, pubSub) => {
  return Promise.resolve(new TestGraphQLPlugin(pubSub));
}

export default bootstrap;
