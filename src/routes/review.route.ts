import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const reviewController = new ReviewController();

const router = Router();

router.post("/", authorizedMiddleware, reviewController.create);
router.get("/my-reviews", authorizedMiddleware, reviewController.getMyReviews);
router.get("/books/:bookId", reviewController.getReviewsByBookId);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

export default router;
