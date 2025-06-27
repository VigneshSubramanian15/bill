import dbConnect from "@/Components/Util/mongodb";
import Bill from "@/Components/Models/Bill";
import Joi from "joi";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";

const billValidationSchema = Joi.object({
  customer: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    number: Joi.string().required(),
    gstNumber: Joi.string().optional().allow(""),
    email: Joi.string().email(),
    address: Joi.string().optional().allow(""),
  }).required(),
  billNumber: Joi.string().required(),
  date: Joi.date().required(),
  items: Joi.array()
    .items(
      Joi.object({
        itemName: Joi.string().required(),
        itemQty: Joi.number().required(),
        itemPrice: Joi.number().required(),
        taxRate: Joi.number().optional().allow(""),
        hsnCode: Joi.string().optional().allow(""),
        metaData: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              label: Joi.string().required(),
              value: Joi.alternatives()
                .try(Joi.string(), Joi.number(), Joi.boolean())
                .required(),
            }),
          )
          .optional()
          .default([]),
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
  try {
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
          return ErrorResponse(res, error.message, 400);
        }
        break;
      case "POST":
        try {
          const { error, value } = billValidationSchema.validate(req.body);
          if (error) {
            return ErrorResponse(res, error.details[0].message, 400);
          }
          const newBill = await Bill.create({
            companyId,
            userId,
            ...value,
          });
          res.status(201).json({ success: true, data: newBill._id });
        } catch (error) {
          return ErrorResponse(res, error.message, 400);
        }
        break;
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return ErrorResponse(res, `Method ${method} Not Allowed`, 405);
    }
  } catch (error) {
    return ErrorResponse(res, error);
  }
}
