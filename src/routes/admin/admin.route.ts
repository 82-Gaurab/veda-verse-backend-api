import { Router } from "express";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
} from "../../middleware/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { userUploads } from "../../middleware/upload.middleware";
import { AdminBookController } from "../../controllers/admin/book.controller";

let adminUserController = new AdminUserController();
let adminBookController = new AdminBookController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

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
