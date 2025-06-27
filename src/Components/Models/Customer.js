import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Customer name is required"],
    },
    gstNumber: {
      type: String,
      required: false,
    },
    number: {
      type: String,
      required: [true, "Customer number is required"],
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Customer ||
  mongoose.model("Customer", CustomerSchema);
