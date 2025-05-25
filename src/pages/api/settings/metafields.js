import dbConnect from "@/Components/Util/mongodb";
import Company from "@/Components/Models/CompanySchema";
import Joi from "joi";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";

const billMetaFieldSchema = Joi.object({
  name: Joi.string().trim().required(),
  label: Joi.string().trim().required(),
  isRequired: Joi.boolean().required(),
  dataType: Joi.string()
    .trim()
    .valid("String", "Number", "Boolean", "MultiSelect", "Select")
    .required(),
  options: Joi.array().items(Joi.string().trim()),
  addToTotal: Joi.boolean().required(),
  displayInPrintBill: Joi.boolean().required(),
});

const customerMetaFieldSchema = Joi.object({
  name: Joi.string().trim().required(),
  label: Joi.string().trim().required(),
  isRequired: Joi.boolean().required(),
  dataType: Joi.string()
    .trim()
    .valid("String", "Number", "Boolean", "MultiSelect", "Select")
    .required(),
  options: Joi.array().items(Joi.string().trim()),
  showInBill: Joi.boolean().required(),
  displayInPrintBill: Joi.boolean().required(),
});

export default async function handler(req, res) {
  await dbConnect();
  const { companyId } = getJWTTokenData(req);
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const company = await Company.findById(companyId).select(
          "billMetaField customerMetaField",
        );
        if (!company) {
          return ErrorResponse(res, "Company not found", 404);
        }
        res.status(200).json({ success: true, data: company });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;

    case "POST":
      try {
        const { metaType, ...metaData } = req.body;

        if (
          !metaType ||
          (metaType !== "billMetaField" && metaType !== "customerMetaField")
        ) {
          return ErrorResponse(res, "Invalid metaType provided", 400);
        }

        let validatedData;
        if (metaType === "billMetaField") {
          const { error, value } = billMetaFieldSchema.validate(metaData);
          if (error) {
            return ErrorResponse(
              res,
              error.details.map((d) => d.message),
              400,
            );
          }
          validatedData = value;
        } else {
          const { error, value } = customerMetaFieldSchema.validate(metaData);
          if (error) {
            return ErrorResponse(
              res,
              error.details.map((d) => d.message),
              400,
            );
          }
          validatedData = value;
        }

        const updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          { $push: { [metaType]: validatedData } },
          { new: true, runValidators: true },
        );

        if (!updatedCompany) {
          return ErrorResponse(res, "Company not found", 404);
        }
        res.status(200).json({ success: true, data: updatedCompany });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;

    case "PUT":
      try {
        const { metaType, _id, ...metaData } = req.body;
        if (
          !metaType ||
          (metaType !== "billMetaField" && metaType !== "customerMetaField")
        ) {
          return ErrorResponse(res, "Invalid metaType provided", 400);
        }
        if (!_id) {
          return ErrorResponse(
            res,
            "Meta field _id is required for update",
            400,
          );
        }

        let validatedData;
        if (metaType === "billMetaField") {
          const { error, value } = billMetaFieldSchema.validate(metaData);
          if (error) {
            return ErrorResponse(
              res,
              error.details.map((d) => d.message),
              400,
            );
          }
          validatedData = value;
        } else {
          const { error, value } = customerMetaFieldSchema.validate(metaData);
          if (error) {
            return ErrorResponse(
              res,
              error.details.map((d) => d.message),
              400,
            );
          }
          validatedData = value;
        }

        const updateData = {};
        updateData[`${metaType}.$.name`] = validatedData.name;
        if (metaType === "billMetaField") {
          updateData[`${metaType}.$.label`] = validatedData.label;
          updateData[`${metaType}.$.dataType`] = validatedData.dataType;
          updateData[`${metaType}.$.options`] = validatedData.options;
          updateData[`${metaType}.$.addToTotal`] = validatedData.addToTotal;
          updateData[`${metaType}.$.displayInBill`] =
            validatedData.displayInBill;
        } else {
          updateData[`${metaType}.$.dataType`] = validatedData.dataType;
          updateData[`${metaType}.$.options`] = validatedData.options;
          updateData[`${metaType}.$.showInBill`] = validatedData.showInBill;
          updateData[`${metaType}.$.displayInPrintBill`] =
            validatedData.displayInPrintBill;
        }

        const updatedCompany = await Company.findOneAndUpdate(
          { _id: companyId, [`${metaType}._id`]: _id },
          { $set: updateData },
          { new: true, runValidators: true },
        );

        if (!updatedCompany) {
          return ErrorResponse(res, "Company or meta field not found", 404);
        }
        res.status(200).json({ success: true, data: updatedCompany });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;

    case "DELETE":
      try {
        const { metaType, _id } = req.body;
        if (
          !metaType ||
          (metaType !== "billMetaField" && metaType !== "customerMetaField")
        ) {
          return ErrorResponse(res, "Invalid metaType provided", 400);
        }
        if (!_id) {
          return ErrorResponse(
            res,
            "Meta field _id is required for deletion",
            400,
          );
        }

        const updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          { $pull: { [metaType]: { _id: _id } } },
          { new: true },
        );

        if (!updatedCompany) {
          return ErrorResponse(res, "Company or meta field not found", 404);
        }
        res.status(200).json({ success: true, data: updatedCompany });
      } catch (error) {
        return ErrorResponse(res, error.message, 400);
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      return ErrorResponse(res, `Method ${method} Not Allowed`, 405);
  }
}
