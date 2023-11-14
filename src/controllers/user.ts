import { User } from "../db/entities/User.js";
import { AppError } from "../utils/errorHandler.js";
import generateToken from "../utils/generateToken.js";
import sendMail from "../utils/sendMail.js";
import { VerificationCode } from "../db/entities/VerificationCode.js";
import bcrypt from 'bcrypt';
import { createStyledEmail } from "../utils/styledEmail.js";

const signupController = async (payload: User) => {
  const { email } = payload;
  const user = await User.findOne({ where: { email }, relations: ["verificationCode"] });

  if (user) {
    if (user.isVerified) {
      throw new AppError("User already exists and is verified", 409, true);
    } else {
      const verificationResult = await sendVerificationCode(user, "Verify your email");
      return {
        success: verificationResult.success,
        message: verificationResult.message,
        user: verificationResult.user,
      }
    }
  } else {
    const newUser = User.create(payload);
    await newUser.save();
    const verificationResult = await sendVerificationCode(newUser, "Verify your email");
    return {
      success: verificationResult.success,
      message: verificationResult.message,
      user: verificationResult.user,
    }
  }
};


const sendVerificationCode = async (payload: User, title: string) => {
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
        payload.verificationCode = vCode;
      } else {
        // Update the existing VerificationCode if it exists
        vCode = await VerificationCode.findOne({
          where: { user: { id: payload.id } },
        });

        if (!vCode) {
          throw new AppError("VerificationCode not found for the user.", 404, true);
        }

        vCode.verificationCode = generatedCode;
        payload.verificationCode = vCode;
        vCode.expiresAt = expiresAt;
      }

      await vCode.save();
      await payload.save();

      // Send the OTP to the user via email
      const emailMessage = createStyledEmail(payload, generatedCode);

      await sendMail(payload.email, title, emailMessage);

      const code = { id: vCode.id, verificationCode: vCode.verificationCode, expiresAt: vCode.expiresAt, createdAt: vCode.createdAt }

      return {
        success: true,
        message: "Verification Code sent successfully",
        user: payload,
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


const activateAccountController = async (email: string, verificationCode: string) => {
  if (!email) {
    throw new AppError("email is required", 400, true);
  }

  if (!verificationCode) {
    throw new AppError("OTP Code is required", 400, true);
  }

  // Check if the user exists
  const user = await User.findOneBy({ email });
  if (!user) {
    throw new AppError("User does not exist", 404, true);
  }

  // Find the corresponding user OTP
  const vCode = await VerificationCode.findOne({ where: { verificationCode }, relations: ["user"] })

  // Check OTP validity and expiration
  if (!vCode || vCode.user.id !== user.id) {
    throw new AppError("Invalid Code", 400, true);
  }

  if (vCode.expiresAt < new Date()) {
    throw new AppError("Code has been expired", 400, true);
  }

  // Check if the account is already activated
  if (user.isVerified) {
    throw new AppError("Account already activated", 400, true);
  }

  vCode.user = null as any;
  await vCode.save();

  // Activate the account and generate a token
  user.isVerified = true;
  user.verificationCode = null as any;
  await user.save();

  // delete the OTP from the database 
  await vCode.remove();

  const token = generateToken(user);

  return {
    success: true,
    message: "Account activated successfully",
    token,
  };
};

const loginController = async (payload: User) => {
  const { email, password } = payload;

  const user = await User.findOne({ where: { email }, relations: ["verificationCode"] });

  if (!user) {
    throw new AppError("User Not Found", 404, true);
  }

  if (!user.isVerified) {
    await sendVerificationCode(user, "Verify your email");
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

const forgetUserPasswordController = async (email: string) => {
  const user = await User.findOne({ where: { email }, relations: ["verificationCode"] });
  if (!user) {
    throw new AppError("User dose not exist", 404, true);
  }
  return sendVerificationCode(user, "Request to reset password");
}

const RestUserPasswordController = async (email: string, verificationCode: string, newPassword: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError("User dose not exist", 404, true);
  }

  const vCode = await VerificationCode.findOne({ where: { verificationCode }, relations: ["user"] })

  if (!vCode || vCode.user.id !== user.id) {
    throw new AppError("Invalid Code", 400, true);
  }

  if (vCode.expiresAt < new Date()) {
    throw new AppError("Code has been expired", 400, true);
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save();

  vCode.user = null as any;
  await vCode.save();

  user.verificationCode = null as any;
  await user.save();

  await vCode.remove();
}

const updateUserPasswordController = async (user: User, oldPassword: string, newPassword: string) => {
  const passwordMatching = await bcrypt.compare(oldPassword, user?.password || '')

  if (!passwordMatching) {
    throw new AppError("Invalid credentials", 400, true);
  }

  user.password = await bcrypt.hash(newPassword, 10)
  await user.save();

  return {
    success: true,
    message: "Password reset successful",
  };
}


export {
  signupController,
  activateAccountController,
  loginController,
  updateUserPasswordController,
  forgetUserPasswordController,
  RestUserPasswordController
}