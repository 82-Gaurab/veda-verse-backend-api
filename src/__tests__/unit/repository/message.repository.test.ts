import mongoose from "mongoose";
import { MessageRepository } from "../../../repository/message.repository";
import { IMessage } from "../../../models/message.model";

describe("Message Repository Unit Tests", () => {
  let messageRepo: MessageRepository;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect("mongodb://127.0.0.1:27017/testdb");
    }
    messageRepo = new MessageRepository();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await mongoose.connection.collection("messages").deleteMany({});
  });

  const getMessageData = (overrides: Partial<IMessage> = {}) => ({
    username: overrides.username || "TestUser",
    userEmail: overrides.userEmail || "testuser@example.com",
    message: overrides.message || "This is a test message",
    isTestimonial: overrides.isTestimonial ?? false,
  });

  it("should create a message", async () => {
    const data = getMessageData();
    const created = await messageRepo.create(data);
    expect(created._id).toBeDefined();
    expect(created.username).toBe(data.username);
    expect(created.userEmail).toBe(data.userEmail);
  });

  it("should update a message", async () => {
    const created = await messageRepo.create(getMessageData());
    const updated = await messageRepo.updateMessage(created._id.toString(), {
      isTestimonial: true,
    });
    expect(updated).toBeDefined();
    expect(updated!.isTestimonial).toBe(true);
  });

  it("should delete a message", async () => {
    const created = await messageRepo.create(getMessageData());
    const deleted = await messageRepo.deleteMessage(created._id.toString());
    expect(deleted).toBe(true);
    const fetched = await messageRepo.getAllMessages(1, 10);
    expect(fetched.messages.length).toBe(0);
  });

  it("should search messages by username, email, or content", async () => {
    // Create multiple messages with unique emails/usernames
    await messageRepo.create(
      getMessageData({ username: "AlphaUser", userEmail: "alpha@example.com" }),
    );
    await messageRepo.create(
      getMessageData({
        username: "BetaUser",
        message: "Hello world",
        userEmail: "beta@example.com",
      }),
    );

    // Search by username
    const { messages: byUsername } = await messageRepo.getAllMessages(
      1,
      10,
      "AlphaUser",
    );
    expect(byUsername.length).toBe(1);
    expect(byUsername[0].username).toBe("AlphaUser");

    // Search by email
    const { messages: byEmail } = await messageRepo.getAllMessages(
      1,
      10,
      "beta@example.com",
    );
    expect(byEmail.length).toBe(1);
    expect(byEmail[0].userEmail).toBe("beta@example.com");

    // Search by message content
    const { messages: byContent } = await messageRepo.getAllMessages(
      1,
      10,
      "Hello world",
    );
    expect(byContent.length).toBe(1);
    expect(byContent[0].message).toBe("Hello world");
  });

  it("should get all messages with pagination", async () => {
    await messageRepo.create(
      getMessageData({ username: "User1", userEmail: "u1@example.com" }),
    );
    await messageRepo.create(
      getMessageData({ username: "User2", userEmail: "u2@example.com" }),
    );

    const { messages, total } = await messageRepo.getAllMessages(1, 10);
    expect(messages.length).toBe(2);
    expect(total).toBe(2);
  });

  it("should get testimonials only", async () => {
    await messageRepo.create(
      getMessageData({
        username: "User1",
        isTestimonial: true,
        userEmail: "test1@example.com",
      }),
    );
    await messageRepo.create(
      getMessageData({
        username: "User2",
        isTestimonial: false,
        userEmail: "test2@example.com",
      }),
    );

    const { messages } = await messageRepo.getTestimonials();
    expect(messages.length).toBe(1);
    expect(messages[0].isTestimonial).toBe(true);
  });
});
