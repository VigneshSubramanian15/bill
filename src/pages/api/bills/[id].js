import dbConnect from '@/Components/Util/mongodb';
import Bill from '@/Components/Models/Bill';
import Joi from 'joi';
import { getJWTTokenData } from '@/Components/Util/auth';

const billValidationSchema = Joi.object({
    customer: Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        number: Joi.string().required(),
        email: Joi.string().email().required(),
        address: Joi.string(),
    }).required(),
    billNumber: Joi.string().required(),
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
    metaData: Joi.object().optional(),
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
                    return res.status(404).json({ success: false, message: 'Bill not found' });
                }
                res.status(200).json({ success: true, data: bill });

            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        case 'PUT':
            try {
                const { error, value } = billValidationSchema.validate(req.body);
                if (error) {
                    return res.status(400).json({ success: false, error: error.details[0].message });
                }
                const updatedBill = await Bill.findOneAndUpdate({ _id: id, companyId }, value, {
                    new: true,
                    runValidators: true,
                });
                if (!updatedBill) {
                    return res.status(404).json({ success: false, message: 'Bill not found' });
                }
                res.status(200).json({ success: true, data: updatedBill });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        case 'DELETE':
            try {
                const deletedBill = await Bill.findOneAndDelete({ _id: id, companyId });
                if (!deletedBill) {
                    return res.status(404).json({ success: false, message: 'Bill not found' });
                }
                res.status(200).json({ success: true, data: {} });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
