import { Router } from "express";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
} from "../../middleware/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { bookUploads, userUploads } from "../../middleware/upload.middleware";
import { AdminBookController } from "../../controllers/admin/book.controller";
import { MessageController } from "../../controllers/message.controller";
import { GenreController } from "../../controllers/genre.controller";
import { ReviewController } from "../../controllers/review.controller";
import { OrderController } from "../../controllers/order.controller";

let adminUserController = new AdminUserController();
let adminBookController = new AdminBookController();
let messageController = new MessageController();
let genreController = new GenreController();
let reviewController = new ReviewController();
let orderController = new OrderController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

//info: Dashboard summary route
router.get("/dashboard", adminUserController.getDashboard);

// info: Messages Routes
router.get("/messages", messageController.getAll);
router.delete("/messages/:id", messageController.deleteMessage);
router.put("/messages/:id", messageController.updateMessage);

// info: Review Routes
router.get("/reviews", reviewController.getAllPaginated);

// info: Order Routes
router.get("/orders", orderController.getAllOrders);
router.delete("/orders/:id", orderController.deleteOrder);
router.put("/orders/:id", orderController.updateOrder);

// info: Genres Routes
router.post("/genres", genreController.create);
router.get("/genres", genreController.getAllPaginated);
router.get("/genres/all", genreController.getAllGenres);
router.get("/genres/:id", genreController.getGenreById);
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
router.post(
  "/books",
  bookUploads.single("coverImg"),
  adminBookController.createBook,
);
router.get("/books", adminBookController.getAllPaginated);
router.post("/books", adminBookController.createBook);
router.delete("/books/:id", adminBookController.deleteBook);
router.put(
  "/books/:id",
  bookUploads.single("coverImg"),
  adminBookController.updateBook,
);

export default router;
