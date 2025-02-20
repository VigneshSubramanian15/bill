import dbConnect from '@/Components/Util/mongodb';
import Company from '@/Components/Models/CompanySchema';
import Joi from 'joi';
import { getJWTTokenData } from '@/Components/Util/auth';

const companyValidationSchema = Joi.object({
    name: Joi.string().trim(),
    address: Joi.array().items(Joi.string().trim()),
    logo: Joi.string().trim().optional(),
    email: Joi.string().trim().optional(),
    website: Joi.string().trim().optional(),
    phoneNumber: Joi.string().trim().optional(),
    tagline: Joi.string().trim().optional(),
    upiId: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional(),
});

export default async function handler(req, res) {
    await dbConnect();
    const { companyId } = getJWTTokenData(req);
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const company = await Company.findById(companyId).select(["-_id", "address", "email", "logo", "name", "phone", "tagline", "website", "phoneNumber", "tagline", "upiId"]);
                if (!company) {
                    return res.status(404).json({ success: false, message: 'Company not found' });
                }
                res.status(200).json({ success: true, data: company });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        case 'PUT':
            try {
                console.log({ req: req.body })
                const { error, value } = companyValidationSchema.validate(req.body);
                console.log({ value })
                if (error) {
                    return res.status(400).json({ success: false, error: error.details.map(d => d.message) });
                }
                const updatedCompany = await Company.findByIdAndUpdate(companyId, value, {
                    new: true,
                    runValidators: true,
                });
                if (!updatedCompany) {
                    return res.status(404).json({ success: false, message: 'Company not found' });
                }
                res.status(200).json({ success: true, data: updatedCompany });
            } catch (error) {
                res.status(400).json({ success: false, error: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }
}
