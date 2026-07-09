const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");

// GET all notifications for current user
router.get("/", protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { userId: req.user.id };
    if (unreadOnly === "true") filter.read = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit)),
      Notification.countDocuments({ userId: req.user.id, read: false }),
    ]);
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    next(err);
  }
});

// PUT mark all as read
router.put("/read-all", protect, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } },
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});

// PUT mark single notification as read
router.put("/:id/read", protect, async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE all notifications
router.delete("/clear", protect, async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
