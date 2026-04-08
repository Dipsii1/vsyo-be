import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import 'dotenv/config';
import cors from 'cors';

// import routes
import indexRouter from './src/routes/index.js';
import authRouter from './src/routes/authRoutes.js';
import productsRouter from './src/routes/productsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// View engine setup (gunakan pug, bukan jade)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "https://vsyo-fe.vercel.app"],
    credentials: true,
  })
);


// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);


// multer setup
app.use("/uploads", express.static("uploads"));

// Error handlers
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});


app.use((req, res, next) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

import serverless from "serverless-http";
export default serverless(app);

