import {Express} from "express";
import {ApolloServer} from "apollo-server-express";
import schemaRegistry from "../loader/SchemaRegistry";
import {ApolloServerPluginDrainHttpServer} from "apollo-server-core";
import * as http from "http";
import {SubscriptionServer} from "subscriptions-transport-ws";
import {execute, subscribe} from "graphql";

/**
 * Creates and starts Apollo Server
 * @param httpServer
 * @param app
 * @param preserveUpgradeHandler set to true if you want to preserve upgrade handler created by Mashroom. Be sure there is one, otherwise subscription wouldn't work
 */
const startGraphQLServer = async (httpServer: http.Server, app: Express, preserveUpgradeHandler = false) => {
  const stitchedSchema = schemaRegistry.getStitchedSchema();

  if (!preserveUpgradeHandler) {
    /*  GraphQL Subscription server has its own upgrade handler for WS
        so there is no need to create additional one in Mashroom
     */
    const upgradeListenersCount = httpServer.listenerCount('upgrade');
    if (upgradeListenersCount > 0) {
      for (let i = 0; i < upgradeListenersCount; i++) {
        const listener: any = httpServer.listeners('upgrade')[i];
        httpServer.removeListener('upgrade', listener);
      }
    }
  }

  const subscriptionServer = SubscriptionServer.create({
    schema: stitchedSchema,
    execute,
    subscribe,
  }, {
    server: httpServer,
    path: '/graphql',
  });

  const apolloServer = new ApolloServer({
    schema: stitchedSchema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          }
        }
      }
    ]
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app });

  schemaRegistry.addChangeListener(() => {
    console.log('schema update due to change');
    const openApolloServer = (apolloServer as any);
    const openSubscriptionServer = (subscriptionServer as any);
    const newSchema = schemaRegistry.getStitchedSchema();
    const schemaDerivedDate = openApolloServer.generateSchemaDerivedData(newSchema);
    openSubscriptionServer.schema = newSchema;
    openApolloServer.schema = newSchema;
    openApolloServer.state.schemaManager.schemaDerivedData = schemaDerivedDate;
  });
}

export default startGraphQLServer;
