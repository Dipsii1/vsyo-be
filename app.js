import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import multer from "multer";

// routes
import indexRouter from "./src/routes/index.js";
import authRouter from "./src/routes/authRoutes.js";
import productsRouter from "./src/routes/productsRoutes.js";

const app = express();

// middleware
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

// disable cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// routes
app.use("/", indexRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

// error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err && err.message === "Only images allowed!") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Untuk local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;