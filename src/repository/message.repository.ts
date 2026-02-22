import { MessageModel, IMessage } from "../models/message.model";
import { CreateMessageDTO } from "../dtos/message.dto";
import { QueryFilter } from "mongoose";

export class MessageRepository {
  async create(data: CreateMessageDTO): Promise<IMessage> {
    const message = new MessageModel(data);
    return await message.save();
  }

  async getAllMessages(
    page: number,
    size: number,
    search?: string,
  ): Promise<{ messages: IMessage[]; total: number }> {
    const filter: QueryFilter<IMessage> = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [messages, total] = await Promise.all([
      MessageModel.find(filter)
        .sort({ createdAt: -1 }) // newest first
        .skip((page - 1) * size)
        .limit(size),
      MessageModel.countDocuments(filter),
    ]);

    return { messages, total };
  }
}
