import { CreateMessageDTO } from "../dtos/message.dto";
import { IMessage } from "../models/message.model";
import { MessageRepository } from "../repository/message.repository";

let messageRepository = new MessageRepository();
export class MessageService {
  async createMessage(data: CreateMessageDTO): Promise<IMessage> {
    return await messageRepository.create(data);
  }

  async getAllMessages(
    page?: string,
    size?: string,
    search?: string,
  ): Promise<{
    messages: IMessage[];
    pagination: {
      page: number;
      size: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const pageNumber = page ? parseInt(page) : 1;
    const pageSize = size ? parseInt(size) : 10;

    const { messages, total } = await messageRepository.getAllMessages(
      pageNumber,
      pageSize,
      search,
    );

    const pagination = {
      page: pageNumber,
      size: pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    };

    return { messages, pagination };
  }
}
