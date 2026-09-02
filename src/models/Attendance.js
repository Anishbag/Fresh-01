// import mongoose from "mongoose";

// const attendanceSchema = new mongoose.Schema(
//   {
//     employee: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },

//     date: {
//       type: Date,
//       required: true,
//     },

//     checkIn: {
//       type: Date,
//       default: null,
//     },

//     checkOut: {
//       type: Date,
//       default: null,
//     },

//     workingHours: {
//       type: Number,
//       default: 0,
//     },

//     status: {
//       type: String,
//       enum: ["Present", "Absent", "Half Day", "Leave"],
//       default: "Present",
//     },

//     mode: {
//       type: String,
//       enum: ["Office", "WFH"],
//       default: "Office",
//     },
//   },
//   {
//     timestamps: true,
//   },
// );

// attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// export default mongoose.model("Attendance", attendanceSchema);

import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },

    // kaj ar time minutes
    workingMinutes: {
      type: Number,
      default: 0,
    },

    paidMinutes: {
      type: Number,
      default: 0,
    },

    workingHours: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Holiday"],
      default: "Present",
    },

    mode: {
      type: String,
      enum: ["Office", "WFH"],
      default: "Office",
    },

    isLateCheckIn: {
      type: Boolean,
      default: false,
    },

    checkInRemark: {
      type: String,
      default: "",
      trim: true,
    },

    isEarlyCheckOut: {
      type: Boolean,
      default: false,
    },

    checkOutRemark: {
      type: String,
      default: "",
      trim: true,
    },

    adminApproved: {
      type: Boolean,
      default: false,
    },

    adminApprovedMinutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 540,
    },

    adminRemark: {
      type: String,
      default: "",
      trim: true,
    },

    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    adminApprovedAt: {
      type: Date,
      default: null,
    },
    
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index(
  {
    employee: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model("Attendance", attendanceSchema);
