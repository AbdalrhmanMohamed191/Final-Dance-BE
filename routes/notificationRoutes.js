// const express = require("express");
// const { authMiddleware } = require("../middleware/authMiddleware");
// const Notification = require("../model/Notification");

// const router = express.Router();

// // === POST /create ===
// router.post("/create", authMiddleware, async (req, res) => {
//   try {
//     const { receiver, type, postId } = req.body;

//     if (receiver.toString() === req.user._id.toString()) {
//       return res.status(400).json({ message: "You cannot send a notification to yourself" });
//     }

//     const allowedTypes = ["like", "comment", "follow"];
//     if (!allowedTypes.includes(type)) {
//       return res.status(400).json({ message: "Invalid notification type" });
//     }

//     try {
//       // إنشاء إشعار جديد
//       const notification = await Notification.create({
//         receiver,
//         sender: req.user._id,
//         type,
//         postId: postId || null,
//       });
//       return res.status(201).json({ message: "Notification created", notification });
//     } catch (err) {
//       // التعامل مع duplicate key
//       if (err.code === 11000) {
//         const existing = await Notification.findOne({ receiver, sender: req.user._id, type, postId });
//         existing.createdAt = Date.now();
//         existing.isRead = false;
//         await existing.save();
//         return res.status(200).json({ message: "Notification updated with latest activity", notification: existing });
//       }
//       throw err;
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // === GET / ===
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     const notifications = await Notification.find({ receiver: req.user._id })
//       .populate("sender", "username profileImage")
//       .populate("postId", "images caption")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const total = await Notification.countDocuments({ receiver: req.user._id });
//     res.status(200).json({
//       notifications,
//       pagination: {
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//         total,
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // === GET /unread-count ===
// router.get("/unread-count", authMiddleware, async (req, res) => {
//   try {
//     const count = await Notification.countDocuments({ receiver: req.user._id, isRead: false });
//     res.status(200).json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === PATCH /:id/read ===
// router.patch("/:id/read", authMiddleware, async (req, res) => {
//   try {
//     const notification = await Notification.findOneAndUpdate(
//       { _id: req.params.id, receiver: req.user._id },
//       { isRead: true },
//       { new: true }
//     );
//     if (!notification) return res.status(404).json({ message: "Notification not found" });
//     res.status(200).json(notification);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === PATCH /read-all ===
// router.patch("/read-all", authMiddleware, async (req, res) => {
//   try {
//     await Notification.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });
//     res.status(200).json({ message: "All notifications marked as read" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === DELETE /:id ===
// router.delete("/:id", authMiddleware, async (req, res) => {
//   try {
//     const notification = await Notification.findOneAndDelete({ _id: req.params.id, receiver: req.user._id });
//     if (!notification) return res.status(404).json({ message: "Notification not found" });
//     res.status(200).json({ message: "Notification deleted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // === DELETE / ===
// router.delete("/", authMiddleware, async (req, res) => {
//   try {
//     await Notification.deleteMany({ receiver: req.user._id });
//     res.status(200).json({ message: "All notifications deleted" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

