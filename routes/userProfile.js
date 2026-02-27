const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const upload = require("../uploads/uploads");

const User = require("../model/User");
const Post = require("../model/Posts");
const { updateProfileSchema } = require("../validation/userValidator");

//   UPDATE PROFILE IMAGE
router.put("/profile/update",authMiddleware,upload.single("image"),async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profileImage = req.file.path;
      await user.save();

      res.status(200).json({
        message: "Profile Updated Successfully",
        profileImage: user.profileImage,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

//   UPDATE USERNAME & BIO
router.patch("/profile/update", authMiddleware, async (req, res) => {
  try {
    const { value, error } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((e) => e.message) });
    }

    const userId = req.user.id;
    const { bio, name } = value;

    const user = await User.findByIdAndUpdate(
      userId,
      { bio, username: name },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile Updated Successfully",
      username: user.username,
      bio: user.bio,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//   GET USER POSTS
router.get("/:userId/posts", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).populate("userId", "username profileImage").sort({
      createdAt: -1,
    });

    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// router.get("/:userId/posts", async (req, res) => {
//   try {
//     const posts = await Post.find({ userId: req.params.userId })
//       .populate("userId", "username profileImage")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ posts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// });

//   FOLLOW USER
router.patch("/:id/follow", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        message: "You can't follow yourself",
      });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!targetUser.followers.includes(currentUserId)) {
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);

      await targetUser.save();
      await currentUser.save();
    }

    res.status(200).json({
      message: "Followed successfully",
      followersCount: targetUser.followers.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//   UNFOLLOW USER
router.patch("/:id/unfollow", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET FOLLOWERS
router.get("/:id/followers", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "username profileImage"
    );

    res.status(200).json({ followers: user.followers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//   GET FOLLOWING
router.get("/:id/following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "username profileImage"
    );

    res.status(200).json({ following: user.following });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET USER BY ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -otp -otpExpired -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get followers and following togetherذ
router.get("/:id/connections", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "username profileImage")
      .populate("following", "username profileImage");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      followers: user.followers,
      following: user.following,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// routes/user.js
router.get('/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/posts/user/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const posts = await Post.find({ userId: user._id }).populate('userId', 'username profileImage');
    res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get all users (except passwords)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// delete user with cascade
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ هينفذ pre remove middleware ويشيل كل حاجة مرتبطة باليوزر
    await user.remove();

    res.status(200).json({ message: "User and all related data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;