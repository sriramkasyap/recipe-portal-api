import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.routes.js";
import mealRouter from "./routes/mealplan.routes.js";
import recipeRouter from "./routes/recipe.routes.js";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin(requestOrigin, callback) {
      callback(null, true);
    },
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 200, // Add this to avoid CORS errors
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Viva Recipes API is running!");
});

app.use("/auth", authRouter);
app.use("/recipes", recipeRouter);
app.use("/mealplan", mealRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/viva-recipes")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
