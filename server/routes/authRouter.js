import express from "express";
import { loginUser, logoutUser, profile, registerUser, updateUser } from "../controller/userController.js";
import { adminMiddleware, creatorMiddleware, protect } from "../middleware/authMiddleware.js";
import { deleteUser, getAllUsers } from "../controller/adminContoller.js";

const route=express.Router()

route.post("/register" ,registerUser)

route.post("/login" , loginUser )

route.get('/logoutUser' , logoutUser)
route.get("/profile" ,  protect, profile)

route.patch("/updateProfile" ,protect, updateUser)


route.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);

// get all users
route.get("/admin/users", protect, creatorMiddleware, getAllUsers);


export default route;