import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { userUploads } from "../middleware/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);

router.put(
  "/update-profile",
  authorizedMiddleware,
  userUploads.single("profilePicture"), // info: image => filename in form data
  authController.updateUser,
);

router.get("/me", authorizedMiddleware, authController.getMyData);

//info: cart
router.put("/cart", authorizedMiddleware, authController.addToCart);
router.patch(
  "/cart/update-quantity",
  authorizedMiddleware,
  authController.updateCartQuantity,
);

router.delete(
  "/cart/remove",
  authorizedMiddleware,
  authController.removeCartItem,
);

router.post(
  "/upload-image",
  authorizedMiddleware,
  userUploads.single("profilePicture"),
  authController.uploadProfilePicture,
);

router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);

router.post(
  "/request-password-reset-otp",
  authController.sendResetPasswordOTPEmail,
);

router.post("/reset-password-otp", authController.resetPasswordOTP);

export default router;
