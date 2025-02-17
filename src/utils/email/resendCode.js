import userModel from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/DBservices.js";
import { emailEmitter } from "./emailEvent.js";

const resendCode = (subject, msg) => {
  return async (req, res, next) => {
    const { email } = req.body;

    const user = await dbServices.findOne({
      model: userModel,
      data: { email },
    });
    if (!user) return next(new Error("user not found", { cause: 404 }));

    if (user.waitingTime && user.waitingTime > Date.now()) {
      return next(
        new Error(`Please wait for ${user.lastSentCount} minutes and try again`)
      );
    }

    user.countOfSentCode++;
    await user.save();

    switch (user.countOfSentCode) {
      case 3:
        user.waitingTime = Date.now() + 1 * 60 * 1000;
        user.lastSentCount = 1;
        await user.save();
        setTimeout(async () => {
          user.waitingTime = null;
          await user.save();
        }, 1 * 60 * 1000);
        return;

      case 5:
        user.waitingTime = Date.now() + 3 * 60 * 1000;
        user.lastSentCount = 3;
        await user.save();
        setTimeout(async () => {
          user.waitingTime = null;
          await user.save();
        }, 3 * 60 * 1000);
        return;

      case 7:
        user.waitingTime = Date.now() + 5 * 60 * 1000;
        user.lastSentCount = 5;
        await user.save();
        setTimeout(async () => {
          user.waitingTime = null;
          await user.save();
        }, 5 * 60 * 1000);
        return;
    }

    emailEmitter.emit("sendEmail", user.email, user.userName, subject);

    return res
      .status(200)
      .json({ success: true, message: "Code Sent Successfully" });
  };
};

export default resendCode;
