import dbConnect from "@/Components/Util/mongodb";
import Bill from "@/Components/Models/Bill";
import { ErrorResponse, getJWTTokenData } from "@/Components/Util/auth";
const { ObjectId } = require("mongodb");

export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    const { companyId } = getJWTTokenData(req);
    if (!companyId) {
      return ErrorResponse(res, 401, "Invalid or missing token");
    }

    const { startDate, endDate } = req.query;

    let query = {
      companyId: new ObjectId(companyId),
    };

    let defaultStartDate = null;
    let defaultEndDate = null;

    if (!startDate && !endDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      defaultStartDate = thirtyDaysAgo;
      defaultEndDate = new Date();
    }

    // Add date filtering
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    } else {
      query.date.$gte = defaultStartDate;
    }

    if (endDate) {
      query.date.$lte = new Date(endDate);
    } else {
      query.date.$lte = defaultEndDate;
    }
    console.log({ query });
    // Aggregate total sales using MongoDB aggregation pipeline
    const result = await Bill.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$total" },
          totalBills: { $sum: 1 },
          averageBillAmount: { $avg: "$total" },
        },
      },
    ]);

    // If no bills found, return zero values
    const totalSales = result.length > 0 ? result[0].totalSales : 0;
    const totalBills = result.length > 0 ? result[0].totalBills : 0;
    const averageBillAmount =
      result.length > 0 ? result[0].averageBillAmount : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalSales: totalSales,
        totalBills: totalBills,
        averageBillAmount: Math.round(averageBillAmount * 100) / 100, // Round to 2 decimal places
        dateRange: {
          startDate:
            startDate ||
            (defaultStartDate
              ? defaultStartDate.toISOString().split("T")[0]
              : null),
          endDate:
            endDate ||
            (defaultEndDate
              ? defaultEndDate.toISOString().split("T")[0]
              : null),
          isDefault: !startDate && !endDate, // Indicates if default 30-day range was used
        },
      },
      message: "Total sales calculated successfully",
    });
  } catch (error) {
    console.error("Error calculating total sales:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
