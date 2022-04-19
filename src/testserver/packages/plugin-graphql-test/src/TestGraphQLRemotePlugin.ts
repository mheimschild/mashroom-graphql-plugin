import { MashroomRemoteGraphQLPlugin } from "../../../../type-definitions";

class TestGraphQLLocalPlugin implements MashroomRemoteGraphQLPlugin {
  getUrl(): string {
    return "https://api.spacex.land/graphql/";
  }
}

export default TestGraphQLLocalPlugin;
