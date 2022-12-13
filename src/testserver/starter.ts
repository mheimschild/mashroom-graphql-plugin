import { resolve } from 'path';
import { mashroomServerContextFactory } from '@mashroom/mashroom';
import startGraphQLServer from "../graphql/server";

(async () => {
  const stopping = false;

  await (async () => {
    const { server, expressApp, loggerFactory } = await mashroomServerContextFactory(resolve('src', 'testserver'));

    await server.start();

    await startGraphQLServer(server._httpServer, expressApp, loggerFactory);

  })();

  // TODO: clean shutdown

})();
