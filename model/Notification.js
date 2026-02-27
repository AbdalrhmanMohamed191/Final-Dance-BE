const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["like", "comment", "follow"],
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index للأداء
notificationSchema.index({ receiver: 1, isRead: 1 });
// Index فريد لمنع duplicate
notificationSchema.index({ receiver: 1, sender: 1, type: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model("Notification", notificationSchema);