import express from "express";
import { registerUser, loginUser, registerWithGoogle, loginWithGoogle, getMe } from "../controllers/authControllers.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// register
router.post("/register", registerUser);
router.post("/register/google", registerWithGoogle);

// login
router.post("/login", loginUser);
router.post("/login/google", loginWithGoogle);

// FIX #2: Tambah middleware authenticate agar req.user tersedia di getMe
router.get("/me", authenticate, getMe);

export default router;