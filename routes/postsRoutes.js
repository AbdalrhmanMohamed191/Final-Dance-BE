const express = require('express');

const router = express.Router();

// IMPORT MIDDLEWARE
const { authMiddleware } = require("../middleware/authMiddleware");
const Post = require("../model/Posts");
const upload = require('../uploads/uploads');
const Comment = require('../model/Comment');

// CREATE POST
router.post("/create", authMiddleware, upload.array("image", 4), async (req, res) => {
    try {
        const images = req.files.map(file => file.path);
        const caption = req.body.caption || '';
        const userId = req.user.id;

        const newPost = new Post({
            caption,
            images,
            userId,
        });

        await newPost.save();

        // Populate 
        await newPost.populate("userId", "username profileImage");

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// GET ALL POSTS
router.get("/"  , async (req, res) => {
    try {
        const posts = await Post.find().populate("userId" , "username profileImage").sort({ createdAt: -1 });
        res.status(200).json({ message: "Posts fetched successfully", posts });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// GET posts of a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .populate("userId", "username profileImage")
      .sort({ createdAt: -1 }); // أحدث البوستات أولاً

    res.status(200).json({ message: "User posts fetched", posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

// LIKE POST || UNLIKE POST
router.put("/:id/like" , authMiddleware , async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id).populate("userId" , "username profileImage");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user has already liked the post
        const userId = req.user._id;
        const isLiked = post.likes.includes(userId);
        
        if (isLiked) {
            post.likes = post.likes.filter((id) => id != userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        res.status(200).json({ message: isLiked ? "Post unliked" : "Post liked", likesCount: post.likes.length });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// DELETE POST
router.delete("/:id" , authMiddleware , async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if user is the owner of the post
        if (post.userId.toString() !== req.user._id) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        // Delete post
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// Get all comments for a post
router.get("/:id/comments", async (req, res) => {
    try {
        const id = req.params.id;
        const comments = await Comment.find({ postId: id }).populate("userId", "username profileImage").sort({ createdAt: -1 });
        res.status(200).json({ message: "Comments fetched successfully", comments });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});
        
module.exports = router;