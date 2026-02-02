import { Router } from "express";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
} from "../../middleware/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
import { uploads } from "../../middleware/upload.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.get("/users", adminUserController.getAllUsers);
router.get("/users/:id", adminUserController.getUserById);
router.put(
  "/users/:id",
  uploads.single("profilePicture"),
  adminUserController.updateUser,
);
router.post(
  "/users",
  uploads.single("profilePicture"),
  adminUserController.createUser,
);
router.delete("/users/:id", adminUserController.deleteUser);

export default router;
