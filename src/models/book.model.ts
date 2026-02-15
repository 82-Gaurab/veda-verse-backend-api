import mongoose, { Document, Schema } from "mongoose";
import { BookType } from "../types/book.type";

const BookSchema: Schema = new Schema<BookType>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String },
  },
  {
    timestamps: true,
  },
);

export interface IBook extends BookType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
