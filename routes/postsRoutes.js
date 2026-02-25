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
        res.status(200).json({ posts });
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

    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error" });
  }
});

// GET posts of a specific user by userId
// router.get("/:userId/posts", authMiddleware, async (req, res) => {
//   try {
//     const posts = await Post.find({ userId: req.params.userId })
//       .populate("userId", "username profileImage")
//       .sort({ createdAt: -1 });

//     res.status(200).json(posts);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });


router.put("/:id/like", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: no user ID" });
    }

    const postId = req.params.id;
    const userId = req.user.id.toString();

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // تأكد إن اللايكات مصفوفة وصافية
    if (!post.likes) post.likes = [];
    post.likes = post.likes.filter(id => id); // إزالة أي null

    // تحقق إذا المستخدم عامل لايك
    const isLiked = post.likes.some(id => id.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId); // إزالة اللايك
    } else {
      post.likes.push(userId); // إضافة لايك
    }

    await post.save();

    res.status(200).json({
      likedByUser: !isLiked,          // هل المستخدم الآن عامل لايك
      likesCount: post.likes.length   // العدد الكلي بعد التغيير
    });
  } catch (error) {
    console.log("LIKE ROUTE ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE POST by owner
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }
        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

// Get all comments for a post
// router.get("/:id/comments", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const comments = await Comment.find({ postId: id }).populate("userId", "username profileImage").sort({ createdAt: -1 });
//         res.status(200).json({ message: "Comments fetched successfully", comments });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal Server error" });
//     }
// });
      
// GET all comments for a post with nested replies
// router.get("/:id/comments", async (req, res) => {
//   try {
//     const id = req.params.id;

//     const comments = await Comment.find({ postId: id })
//       .populate("userId", "username profileImage")
//       .lean()
//       .sort({ createdAt: 1 });

//     const map = {};
//     comments.forEach(c => {
//       c.replies = [];
//       map[c._id] = c;
//     });

//     const roots = [];

//     comments.forEach(c => {
//       if (c.parentComment) {
//         map[c.parentComment]?.replies.push(c);
//       } else {
//         roots.push(c);
//       }
//     });

//     res.status(200).json({
//       message: "Comments fetched successfully",
//       comments: roots
//     });

//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server error" });
//   }
// });

// Get ALL comments for a post with nested replies

router.get("/:id/comments", async (req, res) => {
    try {
        const id = req.params.id;
        const comments = await Comment.find({ postId: id }).populate("userId", "username profileImage").lean().sort({ createdAt: 1 });

        const map = {};
        comments.forEach(c => {
            c.replies = [];
            map[c._id] = c;
        });

        const roots = []; 
        comments.forEach(c => {
            if (c.parentComment) {
                map[c.parentComment]?.replies.push(c);
            } else {
                roots.push(c);
            }
        });

        res.status(200).json({
            message: "Comments fetched successfully",
            comments: roots
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server error" });
    }
});


module.exports = router;