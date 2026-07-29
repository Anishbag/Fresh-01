import mongoose from "mongoose";

const dailyWorkStatusSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    workDate: {
      type: Date,
      required: true,
    },

    plan: {
      type: String,
      required: true,
      trim: true,
    },

    endOfDayStatus: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

dailyWorkStatusSchema.index(
  { employee: 1, project: 1, workDate: 1 },
  { unique: true }
);

export default mongoose.model(
  "DailyWorkStatus",
  dailyWorkStatusSchema
);