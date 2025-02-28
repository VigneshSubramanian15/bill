import dbConnect from '@/Components/Util/mongodb';
import Bill from '@/Components/Models/Bill';
import { getJWTTokenData } from '@/Components/Util/auth';

export default async function handler(req, res) {
    await dbConnect();
    const { companyId } = getJWTTokenData(req)
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const bill = await Bill.findOne({ companyId }).sort({ _id: -1 }).select("billNumber");
                if (!bill) {
                    return res.status(404).json({ success: false, message: 'Bill not found' });
                }
                res.status(200).json({ success: true, data: bill });

            } catch (error) {
                console.log(error);

                res.status(400).json({ success: false, error: error.message });
            }
            break;
        default:
            res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
    }

}