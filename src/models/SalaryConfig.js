import mongoose from "mongoose";

const salaryConfigSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Earning", "Deduction"],
      required: true,
    },

    mode: {
      type: String,
      enum: ["% of gross", "Fixed"],
      default: "% of gross",
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SalaryConfig", salaryConfigSchema);
