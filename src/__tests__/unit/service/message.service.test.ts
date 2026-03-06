import mongoose from "mongoose";
import { MessageService } from "../../../service/message.service";
import { MessageRepository } from "../../../repository/message.repository";
import { IMessage } from "../../../models/message.model";

// --- Mocks ---
jest.mock("../../../repository/message.repository");

describe("MessageService Unit Tests", () => {
  let messageService: MessageService;

  const repo = {
    create: jest.spyOn(MessageRepository.prototype, "create"),
    deleteMessage: jest.spyOn(MessageRepository.prototype, "deleteMessage"),
    getAllMessages: jest.spyOn(MessageRepository.prototype, "getAllMessages"),
    updateMessage: jest.spyOn(MessageRepository.prototype, "updateMessage"),
    getTestimonials: jest.spyOn(MessageRepository.prototype, "getTestimonials"),
  };

  const fakeMessage: Partial<IMessage> = {
    _id: new mongoose.Types.ObjectId(),
    username: "John Doe",
    userEmail: "john@example.com",
    message: "Great service",
    isTestimonial: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    }, // needed for pagination
  };

  beforeEach(() => {
    jest.clearAllMocks();
    messageService = new MessageService();
  });

  // CREATE MESSAGE
  it("should create a new message", async () => {
    const messageData = {
      username: "Alice",
      userEmail: "alice@example.com",
      message: "Awesome!",
    };
    repo.create.mockResolvedValue({
      ...messageData,
      _id: new mongoose.Types.ObjectId(),
    } as any);

    const message = await messageService.createMessage(messageData);
    expect(repo.create).toHaveBeenCalledWith(messageData);
    expect(message.username).toBe(messageData.username);
    expect(message.message).toBe(messageData.message);
  });

  // DELETE MESSAGE
  it("should delete a message", async () => {
    repo.deleteMessage.mockResolvedValue(true);
    const deleted = await messageService.deleteMessage(
      fakeMessage._id!.toString(),
    );
    expect(repo.deleteMessage).toHaveBeenCalledWith(
      fakeMessage._id!.toString(),
    );
    expect(deleted).toBe(true);
  });

  // GET ALL MESSAGES PAGINATED
  it("should get all messages with default pagination", async () => {
    repo.getAllMessages.mockResolvedValue({
      messages: [fakeMessage as any],
      total: 1,
    });

    const result = await messageService.getAllMessages();
    expect(repo.getAllMessages).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.messages).toHaveLength(1);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("should get all messages with custom pagination/search", async () => {
    repo.getAllMessages.mockResolvedValue({
      messages: [fakeMessage as any],
      total: 5,
    });

    const result = await messageService.getAllMessages("2", "2", "Great");
    expect(repo.getAllMessages).toHaveBeenCalledWith(2, 2, "Great");
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.size).toBe(2);
    expect(result.pagination.totalItems).toBe(5);
    expect(result.pagination.totalPages).toBe(3);
  });

  // UPDATE MESSAGE
  it("should update a message", async () => {
    const updateData = { isTestimonial: true };
    repo.updateMessage.mockResolvedValue({
      ...fakeMessage,
      ...updateData,
    } as any);

    const updated = await messageService.updateMessage(
      fakeMessage._id!.toString(),
      updateData,
    );
    expect(repo.updateMessage).toHaveBeenCalledWith(
      fakeMessage._id!.toString(),
      updateData,
    );
    expect(updated!.isTestimonial).toBe(true);
  });

  // GET TESTIMONIALS
  it("should get testimonials", async () => {
    repo.getTestimonials.mockResolvedValue({
      messages: [fakeMessage as IMessage],
    });

    // Call the service
    const result = await messageService.getTestimonials();

    expect(repo.getTestimonials).toHaveBeenCalled();
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].message).toBe(fakeMessage.message);
  });
});
