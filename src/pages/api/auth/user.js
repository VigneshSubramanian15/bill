import dbConnect from "@/Components/Util/mongodb";
import Company from "@/Components/Models/CompanySchema";
import User from "@/Components/Models/UsersSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJWTTokenData } from "@/Components/Util/auth";

export default async function handler(req, res) {
  if (
    req.method !== "POST" &&
    req.method !== "PUT" &&
    req.method !== "GET" &&
    req.method !== "DELETE"
  ) {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    if (req.method === "POST") {
      return await createUser(req, res);
    } else if (req.method === "PUT") {
      return await updateUser(req, res);
    } else if (req.method === "GET") {
      return await getUsers(req, res);
    } else if (req.method === "DELETE") {
      return await deleteUser(req, res);
    }
  } catch (error) {
    console.log("User operation error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Create new user (POST)
async function createUser(req, res) {
  const {
    name,
    email,
    phoneNumber,
    metaFields,
    password,
    access = ["user"], // Default access level
  } = req.body;

  const { companyId } = getJWTTokenData(req);
  if (!name || !email || !phoneNumber || !password || !companyId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const company = await Company.findById(companyId);
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  if (!company.isActive) {
    return res.status(400).json({ message: "Company is not active" });
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    name,
    email,
    phoneNumber,
    metaFields: metaFields || {},
    password: hashedPassword,
    company: companyId,
    access,
    isActive: true,
  });

  const savedUser = await newUser.save();
  console.log("User created:", savedUser);
  const { _id: id, password: userPassword, ...userData } = savedUser.toObject();
  res.status(201).json({
    message: "User created successfully",
    user: {
      id,
      ...userData,
    },
  });
}

// Update existing user (PUT)
async function updateUser(req, res) {
  const {
    userId,
    name,
    email,
    phoneNumber,
    metaFields,
    password,
    access,
    isActive,
  } = req.body;

  const { companyId } = getJWTTokenData(req);
  if (!userId) {
    return res.status(400).json({ message: "User ID is required for update" });
  }

  const existingUser = await User.findOne({ _id: userId, company: companyId });
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const updateData = { name, email, phoneNumber, metaFields, access, isActive };

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    runValidators: true,
  });

  console.log("User updated:", updatedUser);
  const {
    _id: id,
    password: userPassword,
    ...userData
  } = updatedUser.toObject();
  res.status(200).json({
    message: "User updated successfully",
    user: {
      id,
      ...userData,
    },
  });
}

// Get users (GET)
async function getUsers(req, res) {
  const { userId, page = 1, limit = 10, search } = req.query;
  const { companyId } = getJWTTokenData(req);
  console.log("Get users request query:", req.query);

  if (userId) {
    const user = await User.findOne({ _id: userId, company: companyId })
      .populate("company", "name isActive")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { _id: id, ...userData } = user.toObject();
    return res.status(200).json({
      message: "User retrieved successfully",
      user: {
        id,
        ...userData,
      },
    });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  let query = {
    company: companyId,
    isActive: true,
  };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phoneNumber: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .populate("company", "name isActive")
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limitNum);

  const formattedUsers = users.map((user) => {
    const { _id: id, ...userData } = user.toObject();
    return { id, ...userData };
  });

  res.status(200).json({
    message: "Users retrieved successfully",
    users: formattedUsers,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  });
}

async function deleteUser(req, res) {
  const { userId } = req.query;
  const { companyId } = getJWTTokenData(req);

  console.log("Delete user request query:", req.query);

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required for deletion" });
  }

  const existingUser = await User.findOne({ _id: userId, company: companyId });
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const deletedUser = await User.deleteOne({ _id: userId, company: companyId });
  if (!deletedUser.deletedCount) {
    return res
      .status(404)
      .json({ message: "User not found or already deleted" });
  }

  console.log("User deleted:", deletedUser);

  res.status(200).json({ message: "User deleted successfully" });
}
