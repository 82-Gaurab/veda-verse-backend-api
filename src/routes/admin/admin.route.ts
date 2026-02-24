import { Router } from "express";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
} from "../../middleware/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { userUploads } from "../../middleware/upload.middleware";
import { AdminBookController } from "../../controllers/admin/book.controller";
import { MessageController } from "../../controllers/message.controller";
import { GenreController } from "../../controllers/genre.controller";
import { ReviewController } from "../../controllers/review.controller";

let adminUserController = new AdminUserController();
let adminBookController = new AdminBookController();
let messageController = new MessageController();
let genreController = new GenreController();
let reviewController = new ReviewController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

// info: Messages Routes
router.get("/messages", messageController.getAll);

// info: Review Routes
router.get("/reviews", reviewController.getAllPaginated);

// info: Genres Routes
router.get("/genres", genreController.getAllPaginated);
router.put("/genres/:id", genreController.updateGenre);
router.delete("/genres/:id", genreController.deleteGenre);

// info: User Routes
router.get("/users", adminUserController.getAllUsers);
router.get("/users/:id", adminUserController.getUserById);
router.put(
  "/users/:id",
  userUploads.single("profilePicture"),
  adminUserController.updateUser,
);
router.post(
  "/users",
  userUploads.single("profilePicture"),
  adminUserController.createUser,
);
router.delete("/users/:id", adminUserController.deleteUser);

//info: Book Routes
router.get("/books", adminBookController.getAllBooks);
router.post("/books", adminBookController.createBook);
router.delete("/books/:id", adminBookController.deleteBook);

export default router;
