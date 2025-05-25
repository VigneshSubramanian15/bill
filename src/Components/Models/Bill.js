import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metaData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    customer: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
      name: {
        type: String,
        required: [true, "Customer name is required"],
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
        // required: [true, 'Customer address is required']
      },
    },
    billNumber: {
      type: String,
      required: [true, "Bill number is required"],
      trim: true,
    },
    items: [
      {
        itemName: {
          type: String,
          required: [true, "Item name is required"],
        },
        itemQty: {
          type: Number,
          required: [true, "Item quantity is required"],
        },
        metaData: [
          {
            name: {
              type: String,
              required: [true, "Meta field name is required"],
            },
            label: {
              type: String,
              required: [true, "Meta field label is required"],
            },
            value: {
              type: mongoose.Schema.Types.Mixed,
              required: [true, "Meta field value is required"],
            },
            showInBill: {
              type: Boolean,
              default: false,
            },
            dataType: {
              type: String,
              enum: ["String", "Number", "Boolean"],
              default: "String",
            },
          },
        ],
        itemPrice: {
          type: Number,
          required: [true, "Item price is required"],
        },
      },
    ],
    total: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
