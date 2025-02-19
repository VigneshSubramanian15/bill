import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company', // assuming you have a Customer model
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // assuming you have a Customer model
            required: true
        },
        customer: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Customer', // assuming you have a Customer model
                required: true
            },
            name: {
                type: String,
                required: [true, 'Customer name is required']
            },
            number: {
                type: String,
                required: [true, 'Customer number is required']
            },
            email: {
                type: String,
                required: [true, 'Customer email is required']
            },
        },
        billNumber: {
            type: String,
            required: [true, 'Bill number is required'],
            unique: true,
            trim: true,
        },
        items: [
            {
                itemName: {
                    type: String,
                    required: [true, 'Item name is required']
                },
                itemQty: {
                    type: Number,
                    required: [true, 'Item quantity is required']
                },
                itemPrice: {
                    type: Number,
                    required: [true, 'Item price is required']
                },
            },
        ],
        total: {
            type: Number,
            required: [true, 'Total amount is required']
        },
        tax: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        metaData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

export default mongoose.models.Bill || mongoose.model('Bill', BillSchema);
