import {
  MashroomPlugin,
  MashroomPluginConfig,
  MashroomPluginContextHolder,
  MashroomPluginLoader,
  MashroomLoggerFactory,
  MashroomLogger
} from '@mashroom/mashroom/type-definitions';
import {SchemaRegistry} from "./SchemaRegistry";
import {MashroomGraphQLPluginBootstrapFunction} from "../type-definitions";
import {PubSub, PubSubEngine} from "graphql-subscriptions";

class MashroomGraphQLPluginLoader implements MashroomPluginLoader {
  readonly name = "Mashroom GraphQL Plugin Loader";
  private _logger: MashroomLogger;
  private _pubSubEngines: {
    [engineName: string]: PubSubEngine,
  } = {
    memory: new PubSub(),
  }

  constructor(private _schemaRegistry: SchemaRegistry, loggerFactory: MashroomLoggerFactory) {
    this._logger = loggerFactory('mashroom.graphql.plugin.loader');
  }

  generateMinimumConfig(plugin: MashroomPlugin): MashroomPluginConfig {
    return {};
  }

  async load(plugin: MashroomPlugin, config: MashroomPluginConfig, contextHolder: MashroomPluginContextHolder): Promise<void> {
    const bootstrap: MashroomGraphQLPluginBootstrapFunction = plugin.requireBootstrap();
    const { pubSub = 'memory' } = config;
    const graphQLPlugin = await bootstrap(plugin.name, config, contextHolder, this._pubSubEngines[pubSub] || this._pubSubEngines.memory);

    this._logger.info(`Registering GraphQL plugin: ${plugin.name}`);

    await this._schemaRegistry.register(plugin.name, graphQLPlugin);
  }

  async unload(plugin: MashroomPlugin): Promise<void> {
    this._logger.info(`Unregistering GraphQL plugin: ${plugin.name}`);

    await this._schemaRegistry.unregister(plugin.name);

    return Promise.resolve(undefined);
  }
}

export default MashroomGraphQLPluginLoader;
