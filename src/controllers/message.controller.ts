import { Request, Response } from "express";
import { CreateMessageDTO } from "../dtos/message.dto";
import { MessageService } from "../service/message.service";
import z from "zod";

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

  async getAll(req: Request, res: Response) {
    try {
      const { page, size, search } = req.query;

      const { messages, pagination } = await messageService.getAllMessages(
        page as string,
        size as string,
        search as string,
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
}
