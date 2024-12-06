import { Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import UserModel, { UserType } from "../models/User.model.js";
import { CredentialResponse } from "../types/Auth.types.js";

class AuthController {
  static getUser = async (userId: string): Promise<UserType | null> => {
    return UserModel.findById(userId);
  };

  static createUser = async (
    name: string,
    email: string
  ): Promise<UserType> => {
    return UserModel.create({ name, email });
  };

  static getOrCreateUser = async (
    name: string,
    email: string
  ): Promise<{
    user: UserType;
    newUser: boolean;
  }> => {
    const user = await UserModel.findOne({ email });
    if (user) return { user, newUser: false };
    const newUser = await AuthController.createUser(name, email);
    return { user: newUser, newUser: true };
  };

  private static generateAuthToken = (userId: string): string => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || "");
    return token;
  };

  static setAuthCookie = (res: Response, userId: string): Response => {
    const token = AuthController.generateAuthToken(userId);

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: "none",
    });

    return res;
  };

  static getUserDataFromGoogle = async (
    credential: CredentialResponse["credential"]
  ): Promise<{
    name: string | undefined;
    email: string | undefined;
    email_verified: boolean;
  }> => {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
      name: payload?.name,
      email: payload?.email,
      email_verified: payload?.email_verified || false,
    };
  };
}

export default AuthController;
