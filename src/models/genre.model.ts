import mongoose, { Document, Schema } from "mongoose";
import { GenreType } from "../types/genre.type";

const GenreSchema: Schema = new Schema<GenreType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export interface IGenre extends GenreType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const GenreModel = mongoose.model<IGenre>("Genre", GenreSchema);
