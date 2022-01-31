import {MashroomPluginLoaderPluginBootstrapFunction} from '@mashroom/mashroom/type-definitions';
import MashroomGraphQLPluginLoader from "./MashroomGraphQLPluginLoader";
import schemaRegistry from "./SchemaRegistry";

const bootstrap: MashroomPluginLoaderPluginBootstrapFunction = (pluginName, pluginConfig, contextHolder) => {
  const {loggerFactory} = contextHolder.getPluginContext();
  return Promise.resolve(
    new MashroomGraphQLPluginLoader(
      schemaRegistry,
      loggerFactory,
    )
  );
}

export default bootstrap;
