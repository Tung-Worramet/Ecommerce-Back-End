const prisma = require("../config/prisma"); // เชื่อมต่อ database
const bcrypt = require("bcryptjs"); // เข้ารหัส password
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1 Validate body
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Step 2 Check email in DB already ?
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Step 3 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 4 Register
    await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    res.send("Register Success");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1 Check email
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user || !user.enabled) {
      return res.status(400).json({ message: "User not found or not Enabled" });
    }

    // Step 2 Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Step 3 Create payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // Step 4 Generate token
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.json({ payload, token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: req.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
