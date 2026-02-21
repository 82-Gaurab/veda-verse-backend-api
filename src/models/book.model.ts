import mongoose, { Document, Schema } from "mongoose";
import { BookType } from "../types/book.type";

const BookSchema: Schema = new Schema<BookType>(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: [String], default: [] },
    price: { type: Number, required: true },
    stockAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    publishedYear: { type: String },
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
