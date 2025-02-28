import dbConnect from "@/Components/Util/mongodb";
import Bill from "@/Components/Models/Bill";
import Joi from "joi";
import { getJWTTokenData } from "@/Components/Util/auth";

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
  items: Joi.array()
    .items(
      Joi.object({
        itemName: Joi.string().required(),
        itemQty: Joi.number().required(),
        itemPrice: Joi.number().required(),
      }),
    )
    .min(1)
    .required(),
  total: Joi.number().required(),
  tax: Joi.number().default(0),
  discount: Joi.number().default(0),
  metaData: Joi.array().items(Joi.object()).optional(),
});

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;
  const { companyId, userId } = getJWTTokenData(req);

  switch (method) {
    case "GET":
      try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const bills = await Bill.find({ companyId })
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 });
        const total = await Bill.countDocuments({ companyId });
        res.status(200).json({
          success: true,
          data: bills,
          total,
          page: pageNum,
          pages: Math.ceil(total / limitNum),
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case "POST":
      try {
        const { error, value } = billValidationSchema.validate(req.body);
        if (error) {
          return res
            .status(400)
            .json({ success: false, error: error.details[0].message });
        }
        const newBill = await Bill.create({ companyId, userId, ...value });
        res.status(201).json({ success: true, data: newBill });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
