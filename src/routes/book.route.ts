import { Router } from "express";
import { BookController } from "../controllers/book.controller";

const bookController = new BookController();
const router = Router();

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBookById);

export default router;
