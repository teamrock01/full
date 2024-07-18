import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your full name"],
    },
    walletAddress: {
      type: String,
      required: [true, "Please provide your wallet address"],
    },
    network: {
      type: String,
    },
    exchangePlatform: {
      type: String,
      required: [true, "Please provide the exchange"],
    },
    phoneNo: {
      type: String,
      required: [true, "Please provide your phone number"],
    },
    withdrawAmount: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Withdraw = mongoose.model("Withdraw", UserSchema);

export default Withdraw;
