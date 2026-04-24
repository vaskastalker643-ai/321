const express = require("express");
const {
  createReview,
  getApprovedReviews,
  getAllReviews,
  updateReviewModerationStatus,
  deleteReview,
} = require("../models/reviews.model");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const reviews = await getApprovedReviews();
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews.", error: error.message });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text || !rating) {
      return res.status(400).json({ message: "text and rating are required." });
    }

    const normalizedRating = Number(rating);
    if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
      return res.status(400).json({ message: "Rating must be an integer from 1 to 5." });
    }

    const review = await createReview({
      userId: req.user.id,
      text: String(text).trim(),
      rating: normalizedRating,
    });

    return res.status(201).json({
      review,
      message: "Review submitted for moderation.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create review.", error: error.message });
  }
});

router.get("/admin/all", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const reviews = await getAllReviews();
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch all reviews.", error: error.message });
  }
});

router.patch("/:id/moderation-status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { moderationStatus } = req.body;
    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(moderationStatus)) {
      return res.status(400).json({ message: "Invalid moderation status." });
    }

    const updated = await updateReviewModerationStatus(req.params.id, moderationStatus);
    if (!updated) {
      return res.status(404).json({ message: "Review not found." });
    }

    return res.json({ review: updated });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update moderation status.", error: error.message });
  }
});

router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await deleteReview(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Review not found." });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete review.", error: error.message });
  }
});

module.exports = router;
