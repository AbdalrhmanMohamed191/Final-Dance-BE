// routes/storyRoutes.js
const router = require("express").Router();
const Story = require("../model/Stories");

// Get all active stories
router.get("/", async (req, res) => {
  const now = new Date();
  const stories = await Story.find({ expiresAt: { $gt: now } })
    .populate("user", "username profileImage")
    .sort({ createdAt: -1 });
  res.json(stories);
});

// Get a specific story
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const story = await Story.findById(id);
  res.json(story);
});

// Create a new story
router.post("/", async (req, res) => {
  const { image, user } = req.body;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  const newStory = new Story({ image, user, expiresAt });
  await newStory.save();

  // ===== Emit to all connected clients (WebSocket) =====
  const io = req.app.get("io"); // الحصول على io من app
  io.emit("new-story", {
    _id: newStory._id,
    image: newStory.image,
    user: newStory.user,
    expiresAt: newStory.expiresAt,
    createdAt: newStory.createdAt,
  });

  res.json(newStory);
});

// Mark story as seen
router.put("/:id/seen", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const story = await Story.findById(id);
  if (!story) return res.status(404).json({ message: "Story not found" });

  if (!story.seenBy.includes(userId)) {
    story.seenBy.push(userId);
    await story.save();
  }

  res.json({ message: "Story marked as seen", seenBy: story.seenBy });
});

// Update a story
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { image } = req.body;
  await Story.findByIdAndUpdate(id, { image });
  res.json({ message: "Story updated" });
});

// Delete a story
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Story.findByIdAndDelete(id);
  res.json({ message: "Story deleted" });
});

module.exports = router;