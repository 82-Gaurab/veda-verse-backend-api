import mongoose, { Document, Schema } from "mongoose";

const BookSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    genre: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
      },
    ],
    price: { type: Number, required: true },
    stockAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    publishedYear: { type: String },
    coverImg: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

export interface IBook extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  author: string;
  description: string;
  genre: mongoose.Types.ObjectId[];
  price: number;
  stockAmount: number;
  publishedYear?: string;
  coverImg: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BookModel = mongoose.model<IBook>("Book", BookSchema);
