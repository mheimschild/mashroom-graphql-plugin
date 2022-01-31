import {MashroomGraphQLPlugin} from "../type-definitions";
import {stitchSchemas} from "@graphql-tools/stitch";
import {makeExecutableSchema} from "@graphql-tools/schema";
import {GraphQLSchema} from "graphql";

export class SchemaRegistry {
  private _stitchedSchema: any;
  private _schemaByPluginName: {
    [pluginName: string]: MashroomGraphQLPlugin,
  } = {};
  private _changeListeners: Array<() => void> = [];

  constructor() {
    this._stitch();
  }

  private _stitch(): void {
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
      subschemas: Object.values(this._schemaByPluginName).map((schemaDef) => makeExecutableSchema({
        typeDefs: schemaDef.getSchema(),
        resolvers: schemaDef.getResolvers(),
      })),
    })
  }

  private _notifyListeners() {
    this._changeListeners.forEach((l) => l());
  }

  register(pluginName: string, plugin: MashroomGraphQLPlugin) {
    this._schemaByPluginName[pluginName] = plugin;

    this._stitch();
    this._notifyListeners();
  }

  unregister(pluginName: string) {
    delete this._schemaByPluginName[pluginName];

    this._stitch();
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
