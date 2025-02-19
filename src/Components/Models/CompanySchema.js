// models/CompanySchema.js
import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        address: {
            type: [String],
            required: [true, 'Address is required'],
            trim: true,
        },
        logo: {
            type: String,
            default: '',
        },
        tagline: {
            type: String,
            default: '',
        },
        upiId: {
            type: String,
            trim: true,
        },
        isActive: Boolean
    },
    { timestamps: true }
);

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
