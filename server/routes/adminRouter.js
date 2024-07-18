import express from "express";
import { createPost } from "../controller/ProductController.js";
import { adminMiddleware, protect } from "../middleware/authMiddleware.js";
import upload from "../helper/upload.js";
import { updateBalance } from "../controller/adminContoller.js";
import { getAllDeposits, getAllWithdrawals } from "../controller/balanceContoller.js";


const router=express.Router()


router.post("/admin/product",upload.single('image'), protect , adminMiddleware, createPost);
router.put("/UpdateBalance", protect , adminMiddleware, updateBalance);
router.get('/admin/getdeposit' , protect , adminMiddleware, getAllDeposits )
router.get('/admin/getwithdraw' , protect , adminMiddleware, getAllWithdrawals )





export default router;