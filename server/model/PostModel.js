// models/PostModel.js

import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  value: {
    type: Number,
    required: [true, 'Value is required'],
    min: [0, 'Value must be a positive number']
  },
  commission: {
    type: Number,
    required: [true, 'Commission is required'],
    min: [0, 'Commission must be a positive number']
  },
  image: {
    type: String, 
    required: [true, 'At least one image is required'],
  }
}, {
  timestamps: true
});

const Post = mongoose.model('Post', postSchema);

export default Post;
