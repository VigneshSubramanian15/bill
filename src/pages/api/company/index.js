import dbConnect from "@/Components/Util/mongodb";
import Company from "@/Components/Models/CompanySchema";
import Joi from "joi";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";

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
    case "GET":
      try {
        const company = await Company.findById(companyId).select([
          "-_id",
          "address",
          "email",
          "logo",
          "name",
          "phone",
          "tagline",
          "website",
          "phoneNumber",
          "tagline",
          "upiId",
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
        console.log({ req: req.body });
        const { error, value } = companyValidationSchema.validate(req.body);
        console.log({ value });
        if (error) {
          return ErrorResponse(
            res,
            error.details.map((d) => d.message),
            400,
          );
        }
        const updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          value,
          {
            new: true,
            runValidators: true,
          },
        );
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
