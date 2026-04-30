import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// register user 
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validasi input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required"
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "password is required"
      });
    }

    // validasi email 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    // validasi password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "password must be 8 characters or more"
      });
    }

    // cek user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // simpan user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        provider: "local",
        roleId: 2
      }
    });

    // remove password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword
    });

  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// register user with google
const registerWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    // validasi token google
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "IdToken is required"
      });
    }

    // verifikasi token google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token"
      });
    }

    const { sub: googleId, email, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified by Google"
      });
    }

    // cek user apakah sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // FIX #1: Gunakan else if agar blok kedua tidak ikut terjalan setelah linking.
    // FIX #3: Jika user sudah ada tapi provider-nya "local", tolak dengan pesan yang jelas
    //         daripada diam-diam menimpa data mereka.
    if (existingUser && !existingUser.googleId) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in with your password."
      });
    } else if (existingUser && existingUser.googleId) {
      // user sudah terdaftar via Google sebelumnya
      return res.status(400).json({
        success: false,
        message: "User already exists. Please log in instead."
      });
    }

    // buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        provider: "google",
        googleId,
        roleId: 2
      },
    });

    // response tanpa password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: "User registered successfully with Google",
      data: userWithoutPassword
    });

  } catch (error) {
    console.error("Error registering user with Google:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// login user 
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // cek provider sebelum verifikasi password
    if (user.provider === "google") {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please login with Google."
      });
    }

    // cegah error jika password null
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect"
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role?.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// login google
const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "IdToken is required"
      });
    }

    // verifikasi token google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token"
      });
    }

    const { email, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email not verified by Google"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    // FIX #4: Cek googleId (bukan provider) supaya akun yang di-link juga bisa login Google
    if (!user.googleId) {
      return res.status(400).json({
        success: false,
        message: "This account is not registered with Google. Please login with your password."
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role?.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // hapus password dari response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully with Google",
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error("Error logging in with Google:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// me
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        provider: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // FIX #8: Handle jika user tidak ditemukan di DB
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: user
    });

  } catch (error) {
    console.error("Error fetching user profile", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export { registerUser, loginUser, registerWithGoogle, loginWithGoogle, getMe };