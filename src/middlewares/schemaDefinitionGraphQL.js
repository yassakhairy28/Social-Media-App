import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
} from "graphql";

export const ImageType = new GraphQLObjectType({
  name: "Image",
  fields: {
    _id: { type: GraphQLID },
    id: { type: GraphQLID },
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const userType = new GraphQLObjectType({
  name: "user",
  fields: {
    image: { type: ImageType },
    userName: { type: GraphQLString },
  },
});

export const reactionType = new GraphQLObjectType({
  name: "Reaction",
  fields: {
    reaction: { type: GraphQLString },
    userId: {
      type: userType,
    },
  },
});

export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: {
    _id: { type: GraphQLID },
    content: { type: GraphQLString },
    images: { type: new GraphQLList(ImageType) },
    createdBy: { type: userType },
    reactions: { type: new GraphQLList(reactionType) },
  },
});
