import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    address: {
      type: [String],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone Number name is required"],
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    tagline: {
      type: String,
      default: "",
    },
    upiId: {
      type: String,
      trim: true,
    },
    billMetaField: [
      {
        name: String,
        label: String,
        dataType: {
          type: String,
          enum: ["String", "Number", "Boolean", "MultiSelect", "Select"],
        },
        options: [String],
        isRequired: Boolean,
        addToTotal: Boolean,
        displayInPrintBill: Boolean,
      },
    ],
    customerMetaField: [
      {
        name: String,
        label: String,
        dataType: {
          type: String,
          enum: ["String", "Number", "Boolean", "MultiSelect", "Select"],
        },
        options: [String],
        isRequired: Boolean,
        showInBill: Boolean,
        displayInPrintBill: Boolean,
      },
    ],
    Tax: {
      GST: Boolean,
      SimpleTax: Boolean,
    },
    HSNEnabeled: Boolean,
    isActive: Boolean,
  },
  { timestamps: true },
);

export default mongoose.models.Company ||
  mongoose.model("Company", CompanySchema);
