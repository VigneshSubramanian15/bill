import dbConnect from "@/Components/Util/mongodb";
import Company from "@/Components/Models/CompanySchema";
import User from "@/Components/Models/UsersSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const {
    name,
    email,
    phoneNumber,
    metaFields,
    password,
    companyName,
    companyAddress,
    companyLogo,
    companyTagline,
    upiId,
  } = req.body;
  console.log("Registration request body:", req.body);
  if (
    !name ||
    !email ||
    !phoneNumber ||
    !password ||
    !companyName ||
    !companyAddress
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await dbConnect();

    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newCompany = new Company({
      name: companyName,
      address: companyAddress,
      logo: companyLogo || "",
      tagline: companyTagline || "",
      phoneNumber,
      upiId,
      isActive: true,
    });
    const savedCompany = await newCompany.save();
    console.log("Company created:", savedCompany);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phoneNumber,
      metaFields: metaFields || {},
      password: hashedPassword,
      company: savedCompany._id,
      access: ["admin"],
      isActive: true,
    });
    const savedUser = await newUser.save();

    const token = jwt.sign(
      {
        userId: savedUser._id,
        companyId: savedCompany._id,
        access: savedUser.access,
        companyName: savedCompany.name,
        companyModules: savedCompany.modules,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(201).json({
      token,
      companyName: savedCompany.name,
      companyModules: savedCompany.modules,
      access: savedUser.access,
      userName: savedUser.name,
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
