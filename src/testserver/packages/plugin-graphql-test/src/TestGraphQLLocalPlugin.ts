import {MashroomLocalGraphQLPlugin} from "../../../../type-definitions";
import {IResolvers} from "@graphql-tools/utils";
import {DocumentNode} from "graphql";
import {gql} from "apollo-server-core";
import {PubSubEngine} from "graphql-subscriptions";

class TestGraphQLLocalPlugin implements MashroomLocalGraphQLPlugin {
  constructor(private _pubSub: PubSubEngine) {}

  getSchema(): DocumentNode | Array<DocumentNode> | string | Array<string> {
    return gql`
      type Person {
        id: ID!
      }

      type Query {
        personByName(id: ID!): Person
        createPerson(id: ID!): Person
        test: Person
      }
      
      type Subscription {
        personCreated: Person
      }
    `;
  }

  getResolvers(): IResolvers | Array<IResolvers> {
    return {
      Query: {
        personByName: (parent, args) => {
          return {
            id: args.id,
          };
        },

        createPerson: (parent, args) => {
          setTimeout(() => {
            this.getPubSub().publish('PERSON_CREATED', {
              personCreated: {
                id: args.id,
              },
            });
          }, 1500);
        },

        test: () => ({
          id: 42,
        })
      },
      Subscription: {
        personCreated: {
          subscribe: () => this.getPubSub().asyncIterator(['PERSON_CREATED']),
        },
      },
    }
  }

  getPubSub(): PubSubEngine {
    return this._pubSub;
  }
}

export default TestGraphQLLocalPlugin;
