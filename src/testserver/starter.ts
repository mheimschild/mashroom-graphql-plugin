import { resolve } from 'path';
import { mashroomServerContextFactory } from '@mashroom/mashroom';
import startGraphQLServer from "../webapp/server";

(async () => {
  const stopping = false;

  await (async () => {
    const { server, expressApp } = await mashroomServerContextFactory(resolve('src', 'testserver'));

    await server.start();

    await startGraphQLServer(server._httpServer, expressApp);

  })();

  // TODO: clean shutdown

})();
