import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    photo: {
      type: String,
      default: "https://avatars.githubusercontent.com/u/19819005?v=4",
    },
    bio: {
      type: String,
      default: "I am a new user.",
    },
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalBalance: {
      type: Number,
      default: 0, // Default balance can be set to 0
    },
    lastWithdraw: {
      type: Number,
      default: 0, // Default last withdrawal can be set to 0
    },
    lastDeposit: {
      type: Number,
      default: 0, // Default last deposit can be set to 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true, minimize: true }
);

// hash the password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
