import { Request, Response, Router } from "express";
import AuthController from "../controllers/Auth.controller.js";
import verifyToken from "../middleware/auth.middleware.js";
import UserModel from "../models/User.model.js";
const authRouter = Router();

// Login / Register
authRouter.post("/login", async (req: Request, res: Response) => {
  const { credential } = req.body;
  const { name, email, email_verified } =
    await AuthController.getUserDataFromGoogle(credential);

  if (name && email && email_verified) {
    const { user, newUser } = await AuthController.getOrCreateUser(name, email);

    res = AuthController.setAuthCookie(res, (user._id as string).toString());

    res.json({ user, newUser });
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
