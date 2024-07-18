import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { verifyPassword } from "../controller/userController.js";
import { depositFund, withdraw } from "../controller/balanceContoller.js";
import upload from "../helper/upload.js";
import { getAllPosts, getTodaysProfit, getUserActivity, trackUserActivity } from "../controller/ProductController.js";


const router=express.Router()


router.post("/verify-password" , protect , verifyPassword);
router.post("/withdraw" , protect , withdraw);
router.post("/deposit" ,upload.single('image') ,protect , depositFund);
router.get("/getAllProduct"  , protect , getAllPosts);
router.post("/user-activity" , protect , trackUserActivity)
router.get("/user-activity/:userId" , protect,  getUserActivity)
router.get("/user-activity/profit/:userId", protect, getTodaysProfit);




export default router