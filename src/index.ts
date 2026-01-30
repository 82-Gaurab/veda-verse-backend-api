import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { PORT } from "./config";
import cors from "cors";
import morgan from "morgan";

import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin/admin.route";
import { connectDatabase } from "./database/mongodb";
import path from "path";

dotenv.config();
const app: Application = express();
let corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:3005"],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`app is running on: http://localhost:${PORT}`);
  });
}

startServer();
