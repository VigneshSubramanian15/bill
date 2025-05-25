import dbConnect from "@/Components/Util/mongodb";
import Bill from "@/Components/Models/Bill";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";

export default async function handler(req, res) {
  await dbConnect();
  const { companyId } = getJWTTokenData(req);
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const bill = await Bill.findOne({ companyId })
          .sort({ _id: -1 })
          .select("billNumber");
        if (!bill) {
          res.status(200).json({
            success: true,
            data: { billNumber: 0 },
          });
          // return ErrorResponse(res, 'Bill not found', 404);
        }
        res.status(200).json({ success: true, data: bill });
      } catch (error) {
        console.log(error);
        return ErrorResponse(res, error.message, 400);
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return ErrorResponse(res, `Method ${method} Not Allowed`, 405);
  }
}
