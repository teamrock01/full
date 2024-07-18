import mongoose from "mongoose";

const DepositSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 1,
  },
  receipt: {
    type: String, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});
const Deposit = mongoose.model("deposit", DepositSchema);

export default Deposit;
