import { Router } from "express";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { OrderController } from "../controllers/order.controller";

const router = Router();
const orderController = new OrderController();

router.post("/", authorizedMiddleware, orderController.createOrder);
router.get("/my-orders", authorizedMiddleware, orderController.getMyOrders);
router.put("/pay/:orderId", authorizedMiddleware, orderController.payOrder);
export default router;
