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
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    bankAccount: {
      type: String,
      default: "",
    },

    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    payableDays: {
      type: Number,
      default: 0,
    },

    workingDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidDays: {
      type: Number,
      default: 0,
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

    earnedGrossSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    absentDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    absentDeduction: {
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
      default: true,
    },

    pfPercentage: {
      type: Number,
      default: 12,
      min: 0,
      max: 100,
    },

    pfWage: {
      type: Number,
      default: 0,
      min: 0,
    },

    employeePF: {
      type: Number,
      default: 0,
      min: 0,
    },

    // employerPF: {
    //   type: Number,
    //   default: 0,
    //   min: 0,
    // },

    professionalTax: {
      type: Number,
      default: 0,
      min: 0,
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
      min: 0,
    },

    netSalary: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

salarySlipSchema.index(
  {
    employee: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("SalarySlip", salarySlipSchema);
