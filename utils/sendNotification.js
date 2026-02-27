const Notification = require("../model/Notification");

const sendNotification = async ({
  io,
  receiver,
  sender,
  type,
  postId = null,
}) => {
  // امنع إشعار لنفسك
  if (receiver.toString() === sender.toString()) return;

  const notification = await Notification.findOneAndUpdate(
    { receiver, sender, type, postId },
    { isRead: false, createdAt: Date.now() },
    { upsert: true, new: true }
  ).populate("sender", "username profileImage");

  // 🔥 ابعت الإشعار فورًا
  io.to(receiver.toString()).emit("newNotification", notification);

  return notification;
};

module.exports = sendNotification;