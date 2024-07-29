import { Shop } from "../db/entities/Shop.js";
import { User } from "../db/entities/User.js";
import { VerificationCode } from "../db/entities/VerificationCode.js";
import { AppError } from "./errorHandler.js";
import sendMail from "./sendMail.js";
import { createStyledEmail, createStyledEmailShop } from "./styledEmail.js";

export const sendVerificationCode = async (payload: User, title: string) => {
  try {
    if (payload) {
      // Generate a 6-digit Code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      const CODE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour expiration time
      const expiresAt = new Date(Date.now() + CODE_EXPIRATION_TIME);
      let vCode;

      if (!payload.verificationCode) {
        // Create a new VerificationCode if it doesn't exist
        vCode = VerificationCode.create({
          verificationCode: generatedCode,
          user: payload,
          expiresAt: expiresAt,
        });
      } else {
        // Update the existing VerificationCode if it exists
        vCode = await VerificationCode.findOne({
          where: { user: { id: payload.id } },
        });

        if (!vCode) {
          throw new AppError("VerificationCode not found for the user.", 404, true);
        }

        vCode.verificationCode = generatedCode;
        vCode.expiresAt = expiresAt;
      }

      if (!payload.verificationCode) {
        payload.verificationCode = vCode;
      }

      await vCode.save();
      await payload.save();

      // Send the OTP to the user via email
      const emailMessage = createStyledEmail(payload, generatedCode);

      await sendMail(payload.email, title, emailMessage);

      const code = { id: vCode.id, verificationCode: vCode.verificationCode, expiresAt: vCode.expiresAt, createdAt: vCode.createdAt }

      const { verificationCode, password, ...returnedUser } = payload;

      return {
        success: true,
        message: "Verification Code sent successfully",
        user: returnedUser,
        code
      };
    } else {
      throw new AppError("Something went wrong with sending email verification", 500, true);
    }
  } catch (error) {
    console.error("Error sending OTP verification:", error);
    throw new AppError("Error sending email verification", 500, true);
  }
};

export const sendVerificationCodeShop = async (payload: Shop, title: string) => {
  try {
    if (payload) {
      // Generate a 6-digit Code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      const CODE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour expiration time
      const expiresAt = new Date(Date.now() + CODE_EXPIRATION_TIME);
      let vCode;

      if (!payload.verificationCode) {
        // Create a new VerificationCode if it doesn't exist
        vCode = VerificationCode.create({
          verificationCode: generatedCode,
          shop: payload,
          expiresAt: expiresAt,
        });
      } else {
        // Update the existing VerificationCode if it exists
        vCode = await VerificationCode.findOne({
          where: { shop: { shop_id: payload.shop_id } },
        });

        if (!vCode) {
          throw new AppError("VerificationCode not found for the shop.", 404, true);
        }

        vCode.verificationCode = generatedCode;
        payload.verificationCode = vCode;
        vCode.expiresAt = expiresAt;
      }

      if (!payload.verificationCode) {
        payload.verificationCode = vCode;
      }

      await vCode.save();
      await payload.save();

      // Send the OTP to the shop via email
      const emailMessage = createStyledEmailShop(payload, generatedCode);

      await sendMail(payload.email, title, emailMessage);

      const code = { id: vCode.id, verificationCode: vCode.verificationCode, expiresAt: vCode.expiresAt, createdAt: vCode.createdAt }

      const { verificationCode, ...returnedShop } = payload;

      return {
        success: true,
        message: "Verification Code sent successfully",
        shop: returnedShop,
        code
      };
    } else {
      throw new AppError("Something went wrong with sending email verification", 500, true);
    }
  } catch (error) {
    console.error("Error sending OTP verification:", error);
    throw new AppError("Error sending email verification", 500, true);
  }
};