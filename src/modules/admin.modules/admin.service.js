import postModel from "../../DB/models/post.model.js";
import userModel from "../../DB/models/user.model.js";
import * as dbServices from "./../../DB/DBservices.js";

export const getUsersAndPosts = async (req, res, next) => {
  const result = await Promise.all([
    userModel.find({}).paginate(req.query.pageUsers),
    postModel.find({}).paginate(req.query.pagePosts),
  ]);

  return res.status(200).json({ success: true, result });
};

export const changeRole = async (req, res, next) => {
  const { role } = req.body;
  const { userId } = req.params;

  await dbServices.findByIdAndUpdate({
    model: userModel,
    filter: { _id: userId },
    data: { role },
    new: true,
  });

  return res.status(200).json({ success: true, message: "role updated" });
};
