import mongoose, { Document, Schema } from "mongoose";
import { MessageType } from "../types/message.type";

const MessageSchema: Schema = new Schema<MessageType>(
  {
    username: { type: String, required: true },
    userEmail: { type: String, required: true },
    message: { type: String, required: true },
    isTestimonial: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

export interface IMessage extends MessageType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
