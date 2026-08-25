import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    workingDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAvailableMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidCasualLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidSickLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    unpaidLeaveDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualWorkingMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalPaidMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    earlyCheckoutMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    leaveDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },

    earlyCheckoutDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },

    pfApplicable: {
      type: Boolean,
      default: false,
    },

    pfWage: {
      type: Number,
      default: 0,
    },

    employeePF: {
      type: Number,
      default: 0,
    },

    employerPF: {
      type: Number,
      default: 0,
    },

    professionalTax: {
      type: Number,
      default: 0,
    },

    totalDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Finalized"],
      default: "Draft",
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    finalizedAt: {
      type: Date,
      default: null,
    },

    finalizedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);


salarySchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("Salary", salarySchema);
