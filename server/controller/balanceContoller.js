import cloudinary from "../helper/cloudinary.js";
import Deposit from "../model/deposit.js";
import User from "../model/UserModel.js";
import Withdraw from "../model/withdraw.js";
import asyncHandler from "express-async-handler"; // Ensure this is installed and imported correctly

export const withdraw = asyncHandler(async (req, res) => {
    try {
      const { fullName, walletAddress, network, exchangePlatform, phoneNo,withdrawAmount } = req.body;
      const userId = req.user._id; // Extract user ID from the request object


      if (!fullName || !walletAddress || !exchangePlatform || !phoneNo || !withdrawAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newUser = new Withdraw({
        fullName,
        walletAddress,
        network,
        exchangePlatform,
        phoneNo,
        withdrawAmount,
        userId: userId,
      });

      await newUser.save();

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } 
);




export const depositFund = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id; // Extract user ID from the request object

  if (!amount || !req.file) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Function to upload image to Cloudinary using a Promise
  const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "deposit" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  };

  try {
    const depositImage = await uploadToCloudinary(req.file.buffer);

    // Create new post with the uploaded image URL and user ID
    const post = await Deposit.create({
      amount,
      receipt: depositImage,
      userId: userId, // Associate deposit with the user ID
    });

    if (post) {
      res.status(201).json(post);
    } else {
      res.status(400).json({ message: "Invalid post data" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Image upload failed", error: error.message });
  }
});



export const getAllDeposits = asyncHandler(async (req, res) => {
  try {
    // Fetch all deposits and populate the userId field with name and email
    const deposits = await Deposit.find().populate("userId", "name email totalBalance role photo");

    if (!deposits.length) {
      return res.status(404).json({ message: "No deposits found" });
    }

    // Format the deposits to include user details
    const formattedDeposits = deposits.map((deposit) => ({
      amount: deposit.amount,
      receipt: deposit.receipt,
      createdAt: deposit.createdAt,
      user: deposit.userId ? {
        name: deposit.userId.name,
        email: deposit.userId.email,
        totalBalance: deposit.userId.totalBalance,
        role: deposit.userId.role,
        photo: deposit.userId.photo,
      } : null,
    }));

    res.status(200).json(formattedDeposits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch deposits", error: error.message });
  }
});


 // Adjust the path to your User model

// Fetch all withdrawal data
export const getAllWithdrawals = asyncHandler(async (req, res) => {
  try {
    const withdrawals = await Withdraw.find({}).populate('userId', 'name email photo');
    return res.status(200).json(withdrawals);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
