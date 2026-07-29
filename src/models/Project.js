import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },

    consumerName: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      default: 0,
    },

    valuation: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "planning",
        "in-progress",
        "completed",
        "hold",
        "cancelled",
      ],
      default: "planning",
    },

    consumerDetails: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);