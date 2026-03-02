import express, { Application } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";

// info: Routers
import authRouter from "./routes/auth.route";
import adminRouter from "./routes/admin/admin.route";
import bookRouter from "./routes/book.route";
import messageRouter from "./routes/message.route";
import genreRouter from "./routes/genre.route";
import reviewRouter from "./routes/review.route";
import orderRouter from "./routes/order.route";

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

app.use(
  "/api/v1/uploads/users",
  express.static(path.join(__dirname, "../uploads/users")),
);
app.use(
  "/api/v1/uploads/books",
  express.static(path.join(__dirname, "../uploads/books")),
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/books", bookRouter);
app.use("/api/v1/messages", messageRouter);
app.use("/api/v1/genres", genreRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

export default app;
