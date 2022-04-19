import {DocumentNode} from "graphql";
import {IResolvers} from "@graphql-tools/utils";
import {MashroomPluginConfig, MashroomPluginContextHolder } from "@mashroom/mashroom/type-definitions";
import {PubSubEngine} from "graphql-subscriptions";

export interface MashroomLocalGraphQLPlugin {
  getSchema(): DocumentNode | Array<DocumentNode> | string | Array<string>;
  getResolvers(): IResolvers | Array<IResolvers>;
  getPubSub(): PubSubEngine;
}

export interface MashroomRemoteGraphQLPlugin {
  getUrl(): string;
}

export type PubSubType = 'memory' | 'redis';

export type MashroomGraphQLPluginBootstrapFunction = (pluginName: string, config: MashroomPluginConfig, contextHolder: MashroomPluginContextHolder, pubSub: PubSubEngine) => Promise<MashroomLocalGraphQLPlugin | MashroomRemoteGraphQLPlugin>;

export * from '../api';
