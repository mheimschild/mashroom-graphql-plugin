import {MashroomLocalGraphQLPlugin, MashroomRemoteGraphQLPlugin} from "../type-definitions";
import {stitchSchemas} from "@graphql-tools/stitch";
import {makeExecutableSchema} from "@graphql-tools/schema";
import { introspectSchema } from '@graphql-tools/wrap'
import {GraphQLSchema, print} from "graphql";
import fetch from "node-fetch";
import {AsyncExecutor, ExecutionRequest, ExecutionResult} from "@graphql-tools/utils";

const createRemoteExecutor = (url: string): AsyncExecutor => async ({ document, variables }: ExecutionRequest): Promise<ExecutionResult<any>> => {
  const query = print(document);
  const fetchResult = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })
  return await fetchResult.json() as any;
}

export class SchemaRegistry {
  private _stitchedSchema: any;
  private _schemaByPluginName: {
    [pluginName: string]: MashroomLocalGraphQLPlugin | MashroomRemoteGraphQLPlugin,
  } = {};
  private _changeListeners: Array<() => void> = [];

  constructor() {
    this._stitch();
  }

  private async _stitch(): Promise<void> {
    if (Object.keys(this._schemaByPluginName).length === 0) {
      this._stitchedSchema = stitchSchemas({
        subschemas: [
          makeExecutableSchema({
            typeDefs: `
              type Sample {
                id: ID!
              }
              
              type Query {
                sampleById(id: ID!): Sample
              }
            `,
            resolvers: {
              Query: {
                sampleById: () => ({ id: 42 }),
              }
            }
          })
        ]
      });
      return;
    }
    this._stitchedSchema = stitchSchemas({
      subschemas: await Promise.all(Object.values(this._schemaByPluginName).map(async (schemaDef) => {
        if ('getUrl' in schemaDef) {
          const executor = createRemoteExecutor(schemaDef.getUrl());
          const schema = await introspectSchema(executor);
          return {
            schema,
            executor,
          }
        } else {
          return makeExecutableSchema({
            typeDefs: schemaDef.getSchema(),
            resolvers: schemaDef.getResolvers(),
          });
        }
      })),
    });
  }

  private _notifyListeners() {
    this._changeListeners.forEach((l) => l());
  }

  async register(pluginName: string, plugin: MashroomLocalGraphQLPlugin | MashroomRemoteGraphQLPlugin) {
    this._schemaByPluginName[pluginName] = plugin;

    await this._stitch();
    this._notifyListeners();
  }

  async unregister(pluginName: string) {
    delete this._schemaByPluginName[pluginName];

    await this._stitch();
    this._notifyListeners();
  }

  addChangeListener(listener: () => void) {
    this._changeListeners.push(listener);
  }

  getStitchedSchema(): GraphQLSchema {
    return this._stitchedSchema;
  }
}

const schemaRegistry = new SchemaRegistry();

export default schemaRegistry;
