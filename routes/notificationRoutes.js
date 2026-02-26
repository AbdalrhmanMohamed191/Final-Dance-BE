const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Notification = require("../model/Notification");

const router = express.Router();


router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { receiver, type, postId } = req.body;

    if (receiver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot send notification to yourself",
      });
    }

    const allowedTypes = ["like", "comment", "follow"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    const notification = await Notification.create({
      receiver,
      sender: req.user._id,
      type,
      postId: postId || null,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
    })
      .populate("sender", "username profileImage")
      .populate("postId", "image content")
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, receiver: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      receiver: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Notification.deleteMany({ receiver: req.user._id });
    res.status(200).json({ message: "All notifications deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;