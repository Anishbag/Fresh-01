import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    employeeId: {
      type: String,
      unique: true,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "Developer",
        "Designer",
        "Manager",
        "HR",
        "QA",
        "DevOps",
        "Analyst",
      ],
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    salary: {
      type: Number,
      required: true,
      default: 0,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    idProof: {
      type: String,
      default: "",
    },

    pan: {
      type: String,
      default: "",
    },

    bankAccount: {
      type: String,
      default: "",
    },

    emergencyContact: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
