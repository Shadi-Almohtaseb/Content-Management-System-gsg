import { User } from "../db/entities/User.js";
import { AppError } from "../utils/errorHandler.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/sendMail.js";
import { UserOTPVerification } from "../db/entities/UserOTPVerification.js";
import bcrypt from 'bcrypt';

const signupController = async (payload: User) => {
  const { email } = payload;
  const user = await User.findOne({ where: { email }, relations: ["otp"] });

  if (user) {
    if (user.isVerified) {
      throw new AppError("User already exists and is verified", 409, true);
    } else {
      const verificationResult = await sendOTPVerification(user);
      return verificationResult;
    }
  } else {
    const newUser = User.create(payload);
    await newUser.save();
    const verificationResult = await sendOTPVerification(newUser);
    return verificationResult;
  }
};


const sendOTPVerification = async (payload: User) => {
  try {
    if (payload) {
      // Generate a 6-digit OTP
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

      const OTP_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour expiration time
      const expiresAt = new Date(Date.now() + OTP_EXPIRATION_TIME);
      let userOTP;

      if (!payload.otp) {
        // Create a new UserOTPVerification if it doesn't exist
        userOTP = UserOTPVerification.create({
          otp: generatedOTP,
          user: payload,
          expiresAt: expiresAt,
        });
      } else {
        // Update the existing UserOTPVerification if it exists
        userOTP = await UserOTPVerification.findOne({
          where: { user: { id: payload.id } },
        });

        if (!userOTP) {
          throw new AppError("UserOTPVerification not found for the user.", 404, true);
        }

        userOTP.otp = generatedOTP;
        payload.otp = userOTP;
        userOTP.expiresAt = expiresAt;
      }

      await userOTP.save();
      await payload.save();

      // Send the OTP to the user via email
      const emailMessage = `<h3>Hello ${payload.userName}, Enter <b>${generatedOTP}</b> in the app to verify your email address and complete</h3>
      <p>This code <b>Expires in 1 hour</b>.</p>`;

      await sendMail(payload.email, "Verify your email", emailMessage);

      const response = {
        success: true,
        message: "Verification OTP sent successfully",
        user: payload,
      };

      const returnedOTP = { id: userOTP.id, otp: userOTP.otp, expiresAt: userOTP.expiresAt, createdAt: userOTP.createdAt }

      if (!payload.otp) {
        return {
          ...response,
          returnedOTP
        };
      }

      return response;
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
  const userOTP = await UserOTPVerification.findOne({ where: { otp }, relations: ["user"] })

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

  userOTP.user = null as any;
  await userOTP.save();

  // Activate the account and generate a token
  user.isVerified = true;
  user.otp = null as any;
  await user.save();

  // delete the OTP from the database 
  await userOTP.remove();

  const token = generateToken(user);

  return {
    success: true,
    message: "Account activated successfully",
    token,
  };
};

const loginController = async (payload: User) => {
  const { email, password } = payload;

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError("User Not Found", 404, true);
  }

  if (!user.isVerified) {
    await sendOTPVerification(user);
    throw new AppError("Account not activated, check your email to enter the code.", 400, true);
  }

  const passwordMatching = await bcrypt.compare(password, user?.password || '')

  if (!passwordMatching) {
    throw new AppError("Invalid credentials", 400, true);
  }

  const token = generateToken(user);

  return {
    success: true,
    message: "Login successful",
    token,
  };
}


export { signupController, activateAccountController, loginController }