import { Request, Response } from "express";
import { CreateMessageDTO, UpdateMessageDTO } from "../dtos/message.dto";
import { MessageService } from "../service/message.service";
import z from "zod";
import { QueryParams } from "../types/query.type";

const messageService = new MessageService();

export class MessageController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const parsedData = CreateMessageDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res
          .status(404)
          .json({ error: z.prettifyError(parsedData.error) });
      }

      const messageData: CreateMessageDTO = parsedData.data;

      const message = await messageService.createMessage(messageData);

      return res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message ?? "Internal Server Error",
      });
    }
  }
  async deleteMessage(req: Request, res: Response) {
    try {
      const messageId = req.params.id;
      const deleted = await messageService.deleteMessage(messageId);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Message Deleted" });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { page, size, search }: QueryParams = req.query;

      const { messages, pagination } = await messageService.getAllMessages(
        page,
        size,
        search,
      );

      return res.status(200).json({
        success: true,
        data: messages,
        pagination: pagination,
        message: "All Messages Retrieved",
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const validatedData = UpdateMessageDTO.parse(req.body);

      const updatedMessage = await messageService.updateMessage(
        id,
        validatedData,
      );

      res.status(200).json({
        success: true,
        message: "Message updated successfully",
        data: updatedMessage,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getTestimonials(req: Request, res: Response): Promise<void> {
    try {
      const result = await messageService.getTestimonials();

      res.status(200).json({
        success: true,
        data: result.messages,
      });
    } catch (error) {
      console.error("Error fetching testimonials:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch testimonials",
      });
    }
  }
}
