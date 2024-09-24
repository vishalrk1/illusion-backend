import User, { IUser } from "../models/User";
import { generateToken } from "../utils/jwtUtils";

export const registerUser = async (
  userData: Partial<IUser>
): Promise<IUser> => {
  const user = new User(userData);
  user.save();
  return user;
};

export const loginUser = async (
  phone: string,
  password: string
): Promise<{ user: IUser; token: string } | null> => {
  const user = await User.findOne({ phone });
  console.log("Found User: ", user.comparePassword(password))
  if (!user || !(await user.comparePassword(password))) {
    return null;
  }

  user.lastLogin = new Date();
  await user.save();
  const token = generateToken(user);
  return { user, token };
};
