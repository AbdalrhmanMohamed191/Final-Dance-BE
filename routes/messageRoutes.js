// routes/messageRoutes.js
const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Message = require("../model/Message");

const router = express.Router();

// Get messages between two users
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id },
      ],
    }).populate("sender", "username profileImage").populate("receiver", "username profileImage").sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Send message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, text } = req.body;

    // Create message
    let message = await Message.create({
      sender: req.user.id,
      receiver,
      text,
    });

    // Populate sender and receiver
    message = await message.populate("sender", "username profileImage").populate("receiver", "username profileImage");

    // emit to socket
    const io = req.app.get("io");

    // Send to receiver
    io.to(receiver).emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark as Seen 
router.put("/seen", async (req, res) => {
  const { messageIds } = req.body;

  await Message.updateMany(
    { _id: { $in: messageIds } },
    { $set: { seen: true } }
  );

  res.json({ success: true });
});

module.exports = router;