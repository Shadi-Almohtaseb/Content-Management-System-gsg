import { User } from "../db/entities/User.js";
import { AppError } from "../utils/errorHandler.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/sendMail.js";
import { UserOTPVerification } from "../db/entities/UserOTPVerification.js";
import bcrypt from "bcrypt";

const signupController = async (payload: User) => {
  const { email } = payload;
  const user = await User.findOneBy({ email });

  if (user) {
    if (user.isVerified) {
      throw new AppError("User already exists and is verified", 409, true);
    } else {
      return sendOTPVerification(user);
    }
  } else {
    const newUser = User.create(payload);
    try {
      await newUser.save();
      return sendOTPVerification(newUser);
    } catch (error) {
      console.error("Error creating and saving user:", error);
      throw new AppError("Error creating and saving user", 500, true);
    }
  }
};


const sendOTPVerification = async (payload: User) => {
  try {
    if (payload) {
      // Generate a 6-digit OTP
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

      const OTP_EXPIRATION_TIME = 60 * 60 * 1000;
      const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);
      const userOTP = UserOTPVerification.create({
        otp: generatedOTP,
        user: payload,
        expiresAt: expiresAt,
      });
      await userOTP.save();

      // Send the OTP to the user via email
      const emailMessage = `<h3>Hello ${payload.userName}, Enter <b>${generatedOTP}</b> in the app to verify your email address and complete</h3>
      <p>This code <b>Expires in 1 hour</b>.</p>`;

      await sendMail(payload.email, "Verify your email", emailMessage);

      return {
        success: true,
        message: "Verification OTP sent successfully",
        user: payload,
        userOTP: userOTP.otp,
      };
    } else {
      throw new AppError("Something went wrong with sending email verification", 500, true);
    }
  } catch (error) {
    console.error("Error sending OTP verification:", error);
    throw new AppError("Error sending email verification", 500, true);
  }
};


const activateAccountController = async (userId: string, otp: string) => {
  if (!userId) {
    throw new AppError("User ID is required", 400, true);
  }

  if (!otp) {
    throw new AppError("OTP is required", 400, true);
  }

  // Check if the user exists
  const user = await User.findOneBy({ id: userId });
  if (!user) {
    throw new AppError("User does not exist", 404, true);
  }

  // Find the corresponding user OTP
  const userOTPArr = await UserOTPVerification.find({ where: { otp: otp }, relations: ["user"] })
  const userOTP = userOTPArr[0];

  // Check OTP validity and expiration
  if (!userOTP || userOTP.user.id !== user.id) {
    throw new AppError("Invalid OTP", 400, true);
  }

  if (userOTP.expiresAt < new Date()) {
    throw new AppError("OTP has expired", 400, true);
  }

  // Check if the account is already activated
  if (user.isVerified) {
    throw new AppError("Account already activated", 400, true);
  }

  // Activate the account and generate a token
  user.isVerified = true;
  await user.save();

  // Delete the user OTP
  await userOTP.remove();

  const token = generateToken(user);

  return {
    success: true,
    message: "Account activated successfully",
    token,
  };
};


export { signupController, activateAccountController }