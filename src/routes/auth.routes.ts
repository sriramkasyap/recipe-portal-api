import { Request, Response, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth.middleware.js";
import UserModel from "../models/User.model.js";
const authRouter = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login / Register
authRouter.post("/login", async (req: Request, res: Response) => {
  const { credential } = req.body;

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const { name, email, email_verified } = payload || {};

  if (name && email && email_verified) {
    const user = await UserModel.findOne({ email });

    if (user) {
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || ""
      );
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: "strict",
      });
      res.json({ user, newUser: false });
    } else {
      const newUser = await UserModel.create({ name, email });

      const token = jwt.sign(
        { userId: newUser._id },
        process.env.JWT_SECRET || ""
      );

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: "strict",
      });

      res.json({ user: newUser, newUser: true });
    }
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Protected Routes
authRouter.use(verifyToken);

// Get Me
authRouter.get("/me", async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await UserModel.findById(req.userId);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    res.clearCookie("accessToken");
    return;
  }

  res.json({ user });
});

// Logout
authRouter.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.json({ message: "Logged out" });
});

export default authRouter;
