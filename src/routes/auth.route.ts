import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("profilePicture"), // info: image => filename in form data
  authController.updateUser
);

router.post("/upload-image", authorizedMiddleware, uploads.single("profilePicture"), authController.uploadProfilePicture);

export default router;