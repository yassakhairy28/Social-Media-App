import connectDB from "./DB/connectionDB.js";
import adminRouter from "./modules/admin.modules/admin.controller.js";
import authRouter from "./modules/auth.modules/auth.controller.js";
import commentRouter from "./modules/comment.modules/comment.controller.js";
import postRouter from "./modules/post.module/post.controller.js";
import userRouter from "./modules/user.modules/user.controller.js";
import globalErrorHandling from "./utils/error handling/globalErrorHandler.js";
import notFoundHandler from "./utils/error handling/notFoundHandler.js";
import cors from "cors";

const bootstrap = async (app, express) => {
  await connectDB();
  app.use(cors());
  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).send("Welcome to Social Media App");
  });

  app.use("/uploads", express.static("uploads"));

  app.use("/admin", adminRouter);
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("*", notFoundHandler);
  app.use(globalErrorHandling);
};

export default bootstrap;
