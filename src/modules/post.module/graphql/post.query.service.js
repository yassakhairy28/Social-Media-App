import * as dbServices from "../../../DB/DBservices.js";
import postModel from "../../../DB/models/post.model.js";
export const getAllPosts = async (parent, args) => {
  const posts = await dbServices.find({
    model: postModel,
    data: { isDeleted: false },
    select: "content images createdBy reactions",
    populate: [
      { path: "createdBy", select: "userName image -_id" },
      {
        path: "reactions",
        select: "reaction userId -_id -id",
        populate: { path: "userId", select: "userName image -_id" },
      },
    ],
  });

  return {
    success: true,
    statusCode: 200,
    data: posts,
  };
};
