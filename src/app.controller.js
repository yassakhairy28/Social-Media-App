import connectDB from "./DB/connectionDB.js";
import adminRouter from "./modules/admin.modules/admin.controller.js";
import authRouter from "./modules/auth.modules/auth.controller.js";
import commentRouter from "./modules/comment.modules/comment.controller.js";
import postRouter from "./modules/post.module/post.controller.js";
import userRouter from "./modules/user.modules/user.controller.js";
import globalErrorHandling from "./utils/error handling/globalErrorHandler.js";
import notFoundHandler from "./utils/error handling/notFoundHandler.js";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  limit: 50, // limit eacth IP 50 requests per windowMs
});

const bootstrap = async (app, express) => {
  // security
  app.use(helmet());

  // limit request
  app.use(limiter);

  // database
  await connectDB();

  // cors origin
  app.use(cors());

  // body parser
  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).send("Welcome to Social Media App");
  });

  // file uploading
  app.use("/uploads", express.static("uploads"));

  // routes
  app.use("/admin", adminRouter);
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("*", notFoundHandler);
  app.use(globalErrorHandling);
};

export default bootstrap;

// update security with helmet and rate limit
