import dbConnect from '@/Components/Util/mongodb';
import Customer from '@/Components/Models/Customer';
import Joi from 'joi';
import { ErrorResponse, getJWTTokenData } from '@/Components/Util/auth';

// Validation Schema for Updating Customer
const customerValidationSchema = Joi.object({
    name: Joi.string().required().messages({ 'string.empty': 'Customer name is required' }),
    number: Joi.string().required().messages({ 'string.empty': 'Customer number is required' }),
    email: Joi.string().email().required().messages({ 'string.email': 'Invalid email format', 'string.empty': 'Customer email is required' }),
    address: Joi.string().messages({ 'string.empty': 'Address is required' }),
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
                    return ErrorResponse(res, 'Customer not found', 404)
                }
                res.status(200).json({ success: true, data: customer });
            } catch (error) {
                return ErrorResponse(res, error.message, 400)
            }
            break;

        case 'PUT':
            try {
                const { error, value } = customerValidationSchema.validate(req.body);
                if (error) {
                    return ErrorResponse(res, error.details.map(d => d.message), 400)
                }

                const updatedCustomer = await Customer.findOneAndUpdate(
                    { _id: id, companyId },
                    { ...value },
                    { new: true, runValidators: true }
                );

                if (!updatedCustomer) {
                    return ErrorResponse(res, 'Customer not found', 404)
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
                    return ErrorResponse(res, 'Customer not found', 404)
                }

                res.status(200).json({ success: true, message: 'Customer deleted successfully' });
            } catch (error) {
                return ErrorResponse(res, error.message, 400)
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return ErrorResponse(res, `Method ${method} Not Allowed`, 405)
    }
}
