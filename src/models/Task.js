// import mongoose from "mongoose";

// const taskSchema = new mongoose.Schema(
//   {
//     project: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },

//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     assignedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },

//     assignedTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Employee",
//       required: true,
//     },

//     dueDate: {
//       type: Date,
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["Pending", "In Progress", "Completed"],
//       default: "Pending",
//     },

//     progress: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 100,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("Task", taskSchema);



import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    
    assignees: [
      {
        employee: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: true,
        },

        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },

        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
    ],

    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);