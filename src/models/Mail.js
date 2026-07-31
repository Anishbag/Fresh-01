import mongoose from "mongoose";

const mailSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    attachment: {
      type: String,
      default: "",
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Mail", mailSchema);