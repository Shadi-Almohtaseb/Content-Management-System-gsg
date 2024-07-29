import { User } from "../db/entities/User.js";
import { AppError } from "../utils/errorHandler.js";
import { generateUserToken } from "../utils/generateToken.js";
import { VerificationCode } from "../db/entities/VerificationCode.js";
import bcrypt from 'bcrypt';
import { sendVerificationCode } from "../utils/sendVerificationCode.js";

const signupController = async (payload: User) => {
  const { email } = payload;
  const user = await User.findOne({ where: { email }, relations: ["verificationCode"] });

  if (user) {
    if (user.isVerified) {
      throw new AppError("User already exists and is verified", 409, true);
    } else {
      const verificationResult = await sendVerificationCode(user, "Verify your email");
      return verificationResult
    }
  } else {
    const newUser = User.create({ ...payload, createdAt: new Date() });
    await newUser.save();
    const verificationResult = await sendVerificationCode(newUser, "Verify your email");
    return verificationResult
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

  const token = generateUserToken(user);

  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    message: "Account activated successfully",
    user: userWithoutPassword,
    type: user.role,
    token,
  };
};

const loginController = async (payload: User) => {
  const { email, password } = payload;

  const user = await User.findOne({ where: { email }, relations: ["verificationCode"] });

  if (!user) {
    throw new AppError("User Not Found", 404, true);
  }

  if (user.isDeleted) {
    throw new AppError("User dose not exist", 404, true);
  }

  if (!user.isVerified) {
    await sendVerificationCode(user, "Verify your email");
    throw new AppError("Account not activated, check your email to enter the code.", 400, true);
  }

  const passwordMatching = await bcrypt.compare(password, user?.password || '')

  if (!passwordMatching) {
    throw new AppError("Invalid credentials", 400, true);
  }

  const token = generateUserToken(user);

  const { password: _, ...userWithoutPassword } = user;

  return {
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
    type: user.role,
    token,
  };
}

const forgetUserPasswordController = async (email: string) => {
  const user = await User.findOne({ where: { email }, relations: ["verificationCode"] });
  if (!user) {
    throw new AppError("User dose not exist", 404, true);
  }
  const verificationResult = await sendVerificationCode(user, "Request to reset password");

  return verificationResult
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

  return { success: true, message: "Password updated successfully" }
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
    message: "Password Updated successfully",
  };
}

const getUserController = async (userId: string) => {
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new AppError("User dose not exist", 404, true);
  }

  if (user.isDeleted) {
    throw new AppError("User dose not exist", 404, true);
  }

  if (!user.isVerified) {
    throw new AppError("User not verified", 404, true);
  }

  const { password: _, ...userWithoutPassword } = user;


  return {
    success: true,
    user: userWithoutPassword
  };
}

const updateUserProfileController = async (userIn: User, payload: User) => {
  const { userName, phoneNumber, avatar } = payload;

  userIn.userName = userName || userIn.userName;
  userIn.phoneNumber = phoneNumber || userIn.phoneNumber;
  userIn.avatar = avatar || userIn.avatar;
  await userIn.save();

  return {
    success: true,
    message: "Updated successfully",
    user: userIn
  };
}

export {
  signupController,
  activateAccountController,
  loginController,
  updateUserPasswordController,
  forgetUserPasswordController,
  RestUserPasswordController,
  getUserController,
  updateUserProfileController
}