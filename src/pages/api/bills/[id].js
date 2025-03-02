import dbConnect from '@/Components/Util/mongodb';
import Bill from '@/Components/Models/Bill';
import Joi from 'joi';
import { ErrorResponse, getJWTTokenData } from '@/Components/Util/auth';

const billValidationSchema = Joi.object({
    customer: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        number: Joi.string().required(),
        email: Joi.string().email().required(),
        address: Joi.string(),
    }).required(),
    billNumber: Joi.string().required(),
    date: Joi.date().required(),
    items: Joi.array().items(
        Joi.object({
            itemName: Joi.string().required(),
            itemQty: Joi.number().required(),
            itemPrice: Joi.number().required(),
        })
    ).min(1).required(),
    total: Joi.number().required(),
    tax: Joi.number().default(0),
    discount: Joi.number().default(0),
    metaData: Joi.array().items(Joi.object()).optional(),
});

export default async function handler(req, res) {
    await dbConnect();
    const { companyId } = getJWTTokenData(req)
    const {
        query: { id },
        method,
    } = req;

    switch (method) {
        case 'GET':
            try {
                const bill = await Bill.findOne({ _id: id, companyId });
                if (!bill) {
                    return ErrorResponse(res, 'Bill not found', 404)
                }
                res.status(200).json({ success: true, data: bill });

            } catch (error) {
                return ErrorResponse(res, error.message, 400)
            }
            break;
        case 'PUT':
            try {
                const { error, value } = billValidationSchema.validate(req.body);
                if (error) {
                    return ErrorResponse(res, error.details[0].message, 400)
                }
                const updatedBill = await Bill.findOneAndUpdate({ _id: id, companyId }, value, {
                    new: true,
                    runValidators: true,
                });
                if (!updatedBill) {
                    return ErrorResponse(res, 'Bill not found', 404)
                }
                res.status(200).json({ success: true, data: updatedBill });
            } catch (error) {
                return ErrorResponse(res, error.message, 400)
            }
            break;
        case 'DELETE':
            try {
                const deletedBill = await Bill.findOneAndDelete({ _id: id, companyId });
                if (!deletedBill) {
                    return ErrorResponse(res, 'Bill not found', 404)
                }
                res.status(200).json({ success: true, data: {} });
            } catch (error) {
                return ErrorResponse(res, error.message, 400)
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            return ErrorResponse(res, `Method ${method} Not Allowed`, 405)
    }
}
