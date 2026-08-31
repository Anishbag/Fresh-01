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

   

    department: {
      type: String,
      required: true,
      trim: true,
    },
 

    designation: {
      type: String,
      required: true,
      trim: true,
    },

    salary: {
      type: Number,
      required: true,
      default: 0,
    },
    pfApplicable: {
  type: Boolean,
  default: true,
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

    profileImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // New Dynamic field add require by WASS

    customFields: [
      {
        _id: false,

        label: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
