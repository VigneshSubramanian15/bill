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

    // Parse query parameters for date filtering
    const { startDate, endDate } = req.query;

    // Build query filter
    let query = {
      companyId: new ObjectId(companyId),
    };

    // Default to last 30 days if no date range is provided
    let defaultStartDate = null;
    let defaultEndDate = null;

    if (!startDate && !endDate) {
      // Set default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      defaultStartDate = thirtyDaysAgo;
      defaultEndDate = new Date();
    }

    // Add date filtering
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    } else if (defaultStartDate) {
      query.date.$gte = defaultStartDate;
    }

    if (endDate) {
      query.date.$lte = new Date(endDate);
    } else if (defaultEndDate) {
      query.date.$lte = defaultEndDate;
    }

    // Aggregate revenue data by date using MongoDB aggregation pipeline
    const result = await Bill.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
          revenue: { $sum: "$total" },
          billCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date ascending
      },
      {
        $project: {
          date: "$_id",
          revenue: 1,
          billCount: 1,
          _id: 0,
        },
      },
    ]);

    // Format the result for frontend consumption
    const revenueData = result.map((item) => ({
      date: item.date,
      revenue: item.revenue,
      billCount: item.billCount,
      formattedDate: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    }));

    return res.status(200).json({
      success: true,
      data: {
        revenueData: revenueData,
        totalDays: revenueData.length,
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
          isDefault: !startDate && !endDate,
        },
      },
      message: "Revenue data by date retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving revenue data by date:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}
