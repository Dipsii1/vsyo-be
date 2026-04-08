import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";

// import routes 
import indexRouter from "../src/routes/index.js";
import authRouter from "../src/routes/authRoutes.js";
import productsRouter from "../src/routes/productsRoutes.js";

const app = express();


// MIDDLEWARES

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

// app.use(express.static("public"));
// app.use("/uploads", express.static("uploads"));


// ROUTES

app.use("/", indexRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productsRouter);


// HEALTH CHECK (BIAR CEPAT TEST)

app.get("/test", (req, res) => {
  res.json({ message: "API jalan 🚀" });
});


// ERROR HANDLER

app.use((req, res) => {
  res.status(404).json({ message: "Route tidak ditemukan" });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err); // penting untuk lihat di log
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});


// EXPORT SERVERLESS

export default serverless(app);