import dbConnect from "@/Components/Util/mongodb";
import Company from "@/Components/Models/CompanySchema";
import Joi from "joi";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";

const headerFooterSchema = Joi.object({
  billFooter: Joi.object({
    type: Joi.string().valid("Text", "MarkDown", "HTML").required(),
    value: Joi.string().allow("").required(),
  }).optional(),
  billHeader: Joi.object({
    type: Joi.string().valid("Text", "MarkDown", "HTML").required(),
    value: Joi.string().allow("").required(),
  }).optional(),
});

export default async function handler(req, res) {
  await dbConnect();
  const { companyId } = getJWTTokenData(req);
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const company = await Company.findById(companyId).select([
          "billFooter",
          "billHeader",
        ]);
        if (!company) {
          return ErrorResponse(res, "Company not found", 404);
        }
        res.status(200).json({ success: true, data: company });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;
    case "PUT":
      try {
        const { error, value } = headerFooterSchema.validate(req.body);
        if (error) {
          return ErrorResponse(
            res,
            error.details.map((d) => d.message),
            400,
          );
        }
        const updateFields = {};
        if (value.billFooter) updateFields.billFooter = value.billFooter;
        if (value.billHeader) updateFields.billHeader = value.billHeader;
        const updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          { $set: updateFields },
          { new: true, runValidators: true },
        ).select(["billFooter", "billHeader"]);
        if (!updatedCompany) {
          return ErrorResponse(res, "Company not found", 404);
        }
        res.status(200).json({ success: true, data: updatedCompany });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      return ErrorResponse(res, `Method ${method} Not Allowed`, 405);
  }
}
