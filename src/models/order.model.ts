import mongoose, { Schema, Document } from "mongoose";

const OrderSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  books: {
    bookId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  totalPrice: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
