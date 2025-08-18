const mongoose = require("mongoose");

const NAME_REGEX = /^[a-zA-Z\s]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const STUDENT_NO_REGEX = /^24\d{5,6}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      match: [NAME_REGEX, "Name can only contain letters and spaces"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: (v) => PHONE_REGEX.test(v),
        message: "Invalid Phone number",
      },
    },

    studentNumber: {
      type: String,
      required: [true, "Student number is required"],
      unique: true,
      validate: {
        validator: (v) => STUDENT_NO_REGEX.test(v),
        message: "Invalid Student number",
      },
    },

    branch: {
  type: String,
  required: [true, "Branch is required"],
  trim: true,
  enum: {
    values: [
      "CSE(core)",
      "CSE(AIML)",
      "CSE(DS)",
      "CSE(H)",
      "CS",
      "IT",
      "CSIT",
      "AIML",
      "ECE",
      "EN",
      "ME",
      "CE",
    ],
    message: "Invalid branch selected. Please choose a valid branch.",
  },
},

    unstopId: {
  type: String,
  trim: true,
  match: [/^[a-zA-Z0-9_-]+$/, "Invalid unstopId"], 
},

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female"],
    },

    residence: {
      type: String,
      required: [true, "Residence is required"],
      trim: true,
      enum: ["Hosteller", "DayScholar"],
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", function (next) {
  this.lastUpdated = Date.now();
  next();
});
userSchema.virtual("fullName").get(function () {
  return this.name;
});

module.exports = mongoose.model("User", userSchema);
