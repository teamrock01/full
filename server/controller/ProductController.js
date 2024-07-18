import asyncHandler from "express-async-handler";
import Post from "../model/PostModel.js";
import cloudinary from "../helper/cloudinary.js";
import mongoose from 'mongoose';
import User from "../model/UserModel.js";
import UserActivity from "../model/userAtvity.js";

export const createPost = asyncHandler(async (req, res) => {
  const { name, description, value, commission } = req.body;

  if (!name || !description || !value || !commission || !req.file) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({
        folder: "posts"
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      });

      uploadStream.end(fileBuffer);
    });
  };

  try {
    const uploadedImage = await uploadToCloudinary(req.file.buffer);

    const post = await Post.create({
      name,
      description,
      value,
      commission,
      image: uploadedImage,
      user: req.user._id
    });

    if (post) {
      await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });
      res.status(201).json(post);
    } else {
      res.status(400).json({ message: "Invalid post data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Image upload failed", error: error.message });
  }
});

// Function to get all posts
export const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts", error: error.message });
  }
});



export const trackUserActivity = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const product = await Post.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  let userActivity = await UserActivity.findOne({ user: userId });

  if (userActivity) {
    if (userActivity.products.includes(productId)) {
      return res.status(400).json({ message: 'Product already submitted' });
    }
    userActivity.products.push(productId);
    await userActivity.save();
  } else {
    userActivity = new UserActivity({
      user: userId,
      products: [productId],
      status: 'submitted',
      submissionTime: new Date(),
    });
    await userActivity.save();
  }

  // Update user balance
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.totalBalance += product.commission;
  await user.save();

  const totalProducts = await Post.countDocuments();
  const submittedProducts = userActivity.products.length;

  res.status(201).json({
    userId,
    submittedProducts,
    totalProducts,
    productId,
    newBalance: user.totalBalance,
    message: "Product submitted successfully"
  });
});


// Function to get user activity
export const getUserActivity = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const activities = await UserActivity.findOne({ user: userId }).populate('products');
  if (!activities) {
    return res.status(404).json({ message: 'No activities found for user' });
  }

  res.status(200).json(activities);
});


export const getTodaysProfit = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const activities = await UserActivity.find({
    user: userId,
    submissionTime: {
      $gte: startOfToday,
      $lt: endOfToday
    }
  }).populate('products');

  if (!activities) {
    return res.status(404).json({ message: 'No activities found for user today' });
  }

  const todayProfit = activities.reduce((total, activity) => {
    return total + activity.products.reduce((sum, product) => sum + product.commission, 0);
  }, 0);

  res.status(200).json({ todayProfit });
});