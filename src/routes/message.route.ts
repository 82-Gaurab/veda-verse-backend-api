import { Router } from "express";
import { MessageController } from "../controllers/message.controller";

const router = Router();
const messageController = new MessageController();

router.post("/", messageController.create);
router.get("/testimonials", messageController.getTestimonials);

export default router;
