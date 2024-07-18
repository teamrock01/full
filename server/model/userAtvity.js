import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],
  status: {
    type: String,
    enum: ['submitted', 'not-submitted'],
    default: 'not-submitted',
  },
  submissionTime: Date,
}, { timestamps: true });

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
