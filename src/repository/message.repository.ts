import { MessageModel, IMessage } from "../models/message.model";
import { CreateMessageDTO } from "../dtos/message.dto";
import { QueryFilter } from "mongoose";

export class MessageRepository {
  async create(data: CreateMessageDTO): Promise<IMessage> {
    const message = new MessageModel(data);
    return await message.save();
  }
  async deleteMessage(id: string): Promise<boolean> {
    const result = await MessageModel.findByIdAndDelete(id);
    return result ? true : false;
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

  //info: update
  async updateMessage(
    id: string,
    updatedData: Partial<IMessage>,
  ): Promise<IMessage | null> {
    return await MessageModel.findByIdAndUpdate(id, updatedData, { new: true });
  }
  // info: testimonials
  async getTestimonials(): Promise<{ messages: IMessage[] }> {
    const filter: QueryFilter<IMessage> = { isTestimonial: true };

    const [messages] = await Promise.all([
      MessageModel.find(filter).sort({ createdAt: -1 }),
    ]);

    return { messages };
  }
}
