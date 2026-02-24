import mongoose, { Document, Schema } from "mongoose";

const ReviewSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true },
);

ReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
