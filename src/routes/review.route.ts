import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";

const reviewController = new ReviewController();

const router = Router();

router.post("/", reviewController.create);
router.get("/users/:userId", reviewController.getReviewsByUserId);
router.get("/books/:bookId", reviewController.getReviewsByBookId);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

export default router;
