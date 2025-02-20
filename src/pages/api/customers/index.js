import dbConnect from '@/Components/Util/mongodb';
import Customer from '@/Components/Models/Customer';
import Joi from 'joi';
import { getJWTTokenData } from '@/Components/Util/auth';

// Validation Schema
const customerValidationSchema = Joi.object({
    name: Joi.string().required().messages({ 'string.empty': 'Customer name is required' }),
    number: Joi.string().required().messages({ 'string.empty': 'Customer number is required' }),
    email: Joi.string().email().required().messages({ 'string.email': 'Invalid email format', 'string.empty': 'Customer email is required' }),
    address: Joi.string().email().messages({ 'string.empty': 'Address is required' }),
});

export default async function handler(req, res) {
    await dbConnect();

    const { method } = req;
    const { companyId, userId } = getJWTTokenData(req);

    switch (method) {
        case 'GET':
            try {
                const { page = 1, limit = 10, search = "" } = req.query;
                const pageNum = parseInt(page, 10);
                const limitNum = parseInt(limit, 10);
                const skip = (pageNum - 1) * limitNum;

                const searchQuery = search
                    ? {
                        companyId,
                        $or: [
                            { number: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } }
                        ]
                    }
                    : { companyId };

                const customers = await Customer.find(searchQuery)
                    .skip(skip)
                    .limit(limitNum)
                    .sort({ createdAt: -1 });

                const total = await Customer.countDocuments(searchQuery);

                res.status(200).json({
                    success: true,
                    data: customers,
                    total,
                    page: pageNum,
                    pages: Math.ceil(total / limitNum),
                });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }


        case 'POST':
            try {
                const { error, value } = customerValidationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ success: false, error: error.details[0].message });
                }
                const newCustomer = await Customer.create({ companyId, userId, ...value });
                res.status(201).json({ success: true, data: newCustomer });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
