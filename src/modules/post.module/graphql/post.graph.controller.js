import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
} from "graphql";
import * as schemaDefinition from "../../../middlewares/schemaDefinitionGraphQL.js";
import * as postService from "./post.query.service.js";

export const query = {
  getAllPosts: {
    type: new GraphQLObjectType({
      name: "GetAllPostsResponse",
      fields: {
        success: { type: GraphQLBoolean },
        statusCode: { type: GraphQLInt },
        data: { type: new GraphQLList(schemaDefinition.PostType) },
      },
    }),
    resolve: postService.getAllPosts,
  },
};
