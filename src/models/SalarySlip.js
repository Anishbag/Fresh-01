import mongoose from "mongoose";

const salarySlipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    grossSalary: {
      type: Number,
      required: true,
    },

    earnings: [
      {
        label: String,
        amount: Number,
      },
    ],

    deductions: [
      {
        label: String,
        amount: Number,
      },
    ],

    totalEarnings: {
      type: Number,
      default: 0,
    },

    totalDeductions: {
      type: Number,
      default: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

salarySlipSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "SalarySlip",
  salarySlipSchema
);