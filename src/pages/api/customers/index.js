import dbConnect from "@/Components/Util/mongodb";
import Customer from "@/Components/Models/Customer";
import Joi from "joi";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";

const customerValidationSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({ "string.empty": "Customer name is required" }),
  number: Joi.string()
    .required()
    .messages({ "string.empty": "Customer number is required" }),
  gstNumber: Joi.string().alphanum().optional(),
  email: Joi.string().email(),
  address: Joi.string().optional(),
  metaData: Joi.object().optional(),
});

export default async function handler(req, res) {
  await dbConnect();

  const { method } = req;
  const { companyId, userId } = getJWTTokenData(req);

  switch (method) {
    case "GET":
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
                { email: { $regex: search, $options: "i" } },
              ],
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
        return ErrorResponse(res, error.message, 400);
      }

    case "POST":
      try {
        const { error, value } = customerValidationSchema.validate(req.body);
        if (error) {
          return ErrorResponse(
            res,
            error.details.map((d) => d.message),
            400,
          );
        }
        const newCustomer = await Customer.create({
          companyId,
          userId,
          ...value,
        });
        res.status(201).json({ success: true, data: newCustomer });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return ErrorResponse(res, `Method ${method} Not Allowed`, 405);
  }
}
