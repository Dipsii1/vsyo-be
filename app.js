import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";

// routes
import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/authRoutes.js";
import productsRouter from "./src/routes/productsRoutes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://vsyo-fe.vercel.app"],
    credentials: true,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// routes
app.use("/", indexRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);

// error handler
app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;