import dbConnect from '@/Components/Util/mongodb';
import Customer from '@/Components/Models/Customer';
import Joi from 'joi';
import { getJWTTokenData } from '@/Components/Util/auth';

// Validation Schema for Updating Customer
const customerValidationSchema = Joi.object({
    name: Joi.string().required().messages({ 'string.empty': 'Customer name is required' }),
    number: Joi.string().required().messages({ 'string.empty': 'Customer number is required' }),
    email: Joi.string().email().required().messages({ 'string.email': 'Invalid email format', 'string.empty': 'Customer email is required' }),
    address: Joi.string().email().messages({ 'string.empty': 'Address is required' }),
});

export default async function handler(req, res) {
    await dbConnect();

    const { companyId } = getJWTTokenData(req);
    const {
        query: { id },
        method,
    } = req;

    switch (method) {
        case 'GET':
            try {
                const customer = await Customer.findOne({ _id: id, companyId });
                if (!customer) {
                    return res.status(404).json({ success: false, message: 'Customer not found' });
                }
                res.status(200).json({ success: true, data: customer });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case 'PUT':
            try {
                const { error, value } = customerValidationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ success: false, error: error.details[0].message });
                }

                const updatedCustomer = await Customer.findOneAndUpdate(
                    { _id: id, companyId },
                    { ...value },
                    { new: true, runValidators: true }
                );

                if (!updatedCustomer) {
                    return res.status(404).json({ success: false, message: 'Customer not found' });
                }

                res.status(200).json({ success: true, data: updatedCustomer });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        case 'DELETE':
            try {
                const deletedCustomer = await Customer.findOneAndDelete({ _id: id, companyId });

                if (!deletedCustomer) {
                    return res.status(404).json({ success: false, message: 'Customer not found' });
                }

                res.status(200).json({ success: true, message: 'Customer deleted successfully' });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
