import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        metaFields: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        access: {
            type: [String],
            default: [],
        },
        passkeyCredentials: [
            {
                credentialID: { type: String },
                publicKey: { type: String },
                counter: { type: Number },
                transports: { type: [String] },
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
