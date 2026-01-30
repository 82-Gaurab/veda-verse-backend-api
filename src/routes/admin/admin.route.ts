import { Router } from "express";
import {
  adminOnlyMiddleware,
  authorizedMiddleware,
} from "../../middleware/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/admin.controller";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.get("/users", adminUserController.getAllUsers);
router.get("/users/:id", adminUserController.getUserById);
router.put("/users/:id", adminUserController.updateUser);
router.post("/users", adminUserController.createUser);
router.delete("/users/:id", adminUserController.deleteUser);

export default router;
