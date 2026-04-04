import express from "express";
import { registerUser, loginUser, registerWithGoogle, loginWithGoogle } from "../controllers/authControllers.js";

const router = express.Router();

// register
router.post("/register", registerUser);
router.post("/register/google", registerWithGoogle);

// login
router.post("/login", loginUser);
router.post("/login/google", loginWithGoogle);

export default router;