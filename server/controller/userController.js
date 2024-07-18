import asyncHandler from "express-async-handler";
import User from "../model/UserModel.js";
import generateToken from "../helper/generateToken.js";
import bcrypt from "bcrypt";

export const registerUser=asyncHandler(async (req , res)=>{
 
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
      // 400 Bad Request
      res.status(400).json({ message: "All fields are required" });
    }
  
    // check password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      // bad request
      return res.status(400).json({ message: "User already exists" });
    }
    // create new user
  const user = await User.create({
    name,
    email,
    password,
  });


  const token=generateToken(user.id)

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge:  24 * 60 * 60 * 1000, // days
    sameSite: true,
    secure: true,
  });


  if (user) {
    const { _id, name, email, role, photo, bio, isVerified } = user;

    // 201 Created
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }

})


export const loginUser = asyncHandler(async (req, res) => {
    // get email and password from req.body
    const { email, password } = req.body;
  
    // validation
    if (!email || !password) {
      // 400 Bad Request
      return res.status(400).json({ message: "All fields are required" });
    }
  
    // check if user exists
    const userExists = await User.findOne({ email });
  
    if (!userExists) {
      return res.status(404).json({ message: "User not found, sign up!" });
    }
  
    // check id the password match the hashed password in the database
    const isMatch = await bcrypt.compare(password, userExists.password);
  
    if (!isMatch) {
      // 400 Bad Request
      return res.status(400).json({ message: "Invalid credentials" });
    }
  
    // generate token with user id
    const token = generateToken(userExists._id);
  
    if (userExists && isMatch) {
      const { _id, name, email, role, photo, bio, isVerified } = userExists;
  
      // set the token in the cookie
      res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: true,
        secure: true,
      });
  
      // send back the user and token in the response to the client
      res.status(200).json({
        _id,
        name,
        email,
        role,
        photo,
        bio,
        isVerified,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  });


  
  export const verifyPassword=asyncHandler(async (req , res)=>{
    const { password } = req.body;

    // validation
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    const user = await User.findById(req.user._id);

    // check if user exists
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // check if the password matches the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Password verified successfully" });

  })
  // logout user
  export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token");
  
    res.status(200).json({ message: "User logged out" });
  });
  export const profile = asyncHandler(async (req, res) => {
    // get user details from the token ----> exclude password
    const user = await User.findById(req.user._id).select("-password");
  
    if (user) {
      res.status(200).json({
        name: user.name,
        bio: user.bio,
        email:user.email,
        photo: user.photo,
        totalBalance:user.totalBalance,
        lastWithdraw:user.lastWithdraw,
        lastDeposit:user.lastDeposit,
      });
    } else {
      // 404 Not Found
      res.status(404).json({ message: "User not found" });
    }
  });


  
  export const updateUser = asyncHandler(async (req, res) => {
    // get user details from the token ----> protect middleware
    const user = await User.findById(req.user._id);
  
    if (user) {
      // user properties to update
      const { name, bio, photo } = req.body;
      // update user properties
      user.name = req.body.name || user.name;
      user.bio = req.body.bio || user.bio;
      user.photo = req.body.photo || user.photo;
  
      const updated = await user.save();
  
      res.status(200).json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        photo: updated.photo,
        bio: updated.bio,
        isVerified: updated.isVerified,
      });
    } else {
      // 404 Not Found
      res.status(404).json({ message: "User not found" });
    }
  });