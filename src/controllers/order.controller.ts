import { Request, Response } from "express";
import { CreateOrderDTO, UpdateOrderDTO } from "../dtos/order.dto";
import { OrderService } from "../service/order.service";
import { QueryParams } from "../types/query.type";

const orderService = new OrderService();

export class OrderController {
  // info: create
  async createOrder(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const userId = req.user._id.toString();

      const order = await orderService.createOrder(userId);

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  // info: Delete
  async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await orderService.deleteOrder(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // info: Get All Orders (Paginated)
  async getAllOrders(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;

      const { orders, pagination } = await orderService.getAllOrdersPaginated(
        page,
        size,
        search,
      );

      return res.status(200).json({
        success: true,
        data: orders,
        pagination: pagination,
        message: "All Orders Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  // info: Update
  async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const validatedData = UpdateOrderDTO.parse(req.body);

      const updatedOrder = await orderService.updateOrder(id, validatedData);

      res.status(200).json({
        success: true,
        message: "Order updated successfully",
        data: updatedOrder,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
  async getMyOrders(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const userId = req.user._id;
      const orders = await orderService.getOrdersByUserId(userId);

      return res.status(200).json({ success: true, data: orders });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch orders",
      });
    }
  }
}
