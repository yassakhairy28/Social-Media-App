import { GraphQLObjectType, GraphQLSchema } from "graphql";
import * as postController from "./modules/post.module/graphql/post.graph.controller.js";
export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainQuery",
    fields: {
      ...postController.query,
    },
  }),
});
