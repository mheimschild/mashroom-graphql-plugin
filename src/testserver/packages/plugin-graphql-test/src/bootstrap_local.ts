import {MashroomGraphQLPluginBootstrapFunction} from "../../../../type-definitions";
import TestGraphQLLocalPlugin from "./TestGraphQLLocalPlugin";

const bootstrap: MashroomGraphQLPluginBootstrapFunction = (pluginName, config, contextHolder, pubSub) => {
  return Promise.resolve(new TestGraphQLLocalPlugin(pubSub));
}

export default bootstrap;
