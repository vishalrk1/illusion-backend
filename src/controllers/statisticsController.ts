import { Request, Response } from "express";
import User from "../models/User";
import Order from "../models/Order";
import Category from "../models/Category";
import Product from "../models/Product";

import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const getDateRange = (days: number): [Date, Date] => {
  const endDate = new Date();
  const startDate = dayjs().subtract(days, "day").toDate();
  return [startDate, endDate];
};

const getTimeUnit = (days: number): "day" | "week" | "month" | "year" => {
  if (days <= 20) return "day";
  if (days <= 30) return "week";
  if (days <= 365) return "month";
  return "year";
};

const getDisplayFormat = (
  timeUnit: "day" | "week" | "month" | "year"
): string => {
  switch (timeUnit) {
    case "day":
      return "DD-MM-YYYY";
    case "week":
      return "YYYY-[W]WW"; // ISO week format
    case "month":
      return "MM-YYYY";
    case "year":
      return "YYYY";
  }
};

const getDateFormat = (timeUnit: "day" | "week" | "month" | "year"): string => {
  switch (timeUnit) {
    case "day":
      return "%d-%m-%Y";
    case "week":
      return "%Y-W%V"; // ISO week format for MongoDB
    case "month":
      return "%m-%Y";
    case "year":
      return "%Y";
  }
};

const fillMissingDates = (
  data: any[],
  startDate: Date,
  endDate: Date,
  timeUnit: "day" | "week" | "month" | "year"
) => {
  const filledData = [];
  let currentDate = dayjs(startDate);
  const endDayjs = dayjs(endDate);

  while (
    currentDate.isBefore(endDayjs) ||
    currentDate.isSame(endDayjs, timeUnit)
  ) {
    let dateKey = currentDate.format(getDisplayFormat(timeUnit));

    const existingData = data.find((item) => item._id === dateKey);

    filledData.push({
      _id: dateKey,
      count: existingData ? existingData.count : 0,
    });

    currentDate = currentDate.add(1, timeUnit);
  }

  return filledData;
};

const aggregateUsersData = async (
  startDate: Date,
  endDate: Date,
  timeUnit: "day" | "week" | "month" | "year"
) => {
  const aggregationPipeline = [
    {
      $facet: {
        activeUsers: [
          { $match: { lastLogin: { $gte: startDate, $lte: endDate } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: getDateFormat(timeUnit),
                  date: "$lastLogin",
                },
              },
              count: { $sum: 1 },
            },
          },
        ],
        newUsers: [
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: getDateFormat(timeUnit),
                  date: "$createdAt",
                },
              },
              count: { $sum: 1 },
            },
          },
        ],
        totalUsers: [{ $group: { _id: null as any, count: { $sum: 1 } } }],
      },
    },
  ];

  let userData = await User.aggregate(aggregationPipeline);
  if (userData && userData.length > 0) {
    userData[0].activeUsers = fillMissingDates(
      userData[0].activeUsers,
      startDate,
      endDate,
      timeUnit
    );
    userData[0].newUsers = fillMissingDates(
      userData[0].newUsers,
      startDate,
      endDate,
      timeUnit
    );
  }
  return userData;
};

const aggregateProductsData = async (
  startDate: Date,
  endDate: Date,
  timeUnit: "day" | "week" | "month" | "year"
) => {
  const aggregationPipeline = [
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    {
      $unwind: "$categoryInfo",
    },
    {
      $group: {
        _id: "$categoryInfo._id",
        category: { $first: "$categoryInfo.title" },
        productsInStock: { $sum: "$stockQuantity" },
        productCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: 1,
        productsInStock: 1,
        productCount: 1,
        averagePrice: { $divide: ["$totalRevenue", "$productsInStock"] },
      },
    },
  ];
  let productsData = null;
  productsData = await Product.aggregate(aggregationPipeline);
  return productsData;
};

const fillMissingOrdersDates = (
  data: any[],
  startDate: Date,
  endDate: Date,
  timeUnit: "day" | "week" | "month" | "year"
) => {
  const filledData = [];
  let currentDate = dayjs(startDate);
  const endDayjs = dayjs(endDate);

  while (
    currentDate.isBefore(endDayjs) ||
    currentDate.isSame(endDayjs, timeUnit)
  ) {
    let dateKey = currentDate.format(getDisplayFormat(timeUnit));

    const existingData = data.find((item) => item._id === dateKey);

    filledData.push({
      _id: dateKey,
      totalOrderCount: existingData ? existingData.totalOrderCount : 0,
      totalRevenue: existingData ? existingData.totalRevenue : 0,
    });

    currentDate = currentDate.add(1, timeUnit);
  }

  return filledData;
};

const aggregateOrdersData = async (
  startDate: Date,
  endDate: Date,
  timeUnit: "day" | "week" | "month" | "year"
) => {
  const aggregationPipeline = [
    // Match the date range first
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    // Group by date and order ID to count unique orders first
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: getDateFormat(timeUnit),
              date: "$createdAt",
            },
          },
          orderId: "$_id", // Use the unique order ID
        },
        totalRevenue: { $sum: "$totalAmount" }, // Sum totalAmount of each order
      },
    },
    // Calculate the total order count by date
    {
      $group: {
        _id: "$_id.date",
        totalOrderCount: { $sum: 1 }, // Count unique orders
        totalRevenue: { $sum: "$totalRevenue" }, // Sum total revenue
      },
    },
    // Sort the results by date
    {
      $sort: { _id: 1 as any },
    },
  ];
  let ordersData = await Order.aggregate(aggregationPipeline);
  ordersData = fillMissingOrdersDates(ordersData, startDate, endDate, timeUnit);
  return ordersData;
};

export const getUserStats = async (req: Request, res: Response) => {
  const days =
    typeof req.query.days === "string" ? parseInt(req.query.days, 10) : 20;
  const [startDate, endDate] = getDateRange(days);
  const timeUnit = getTimeUnit(days);

  try {
    const [userData, productsData, ordersData] = await Promise.all([
      aggregateUsersData(startDate, endDate, timeUnit),
      aggregateProductsData(startDate, endDate, timeUnit),
      aggregateOrdersData(startDate, endDate, timeUnit),
    ]);

    res.status(200).json({
      message: "User Stats fetched successfully",
      userData,
      productsData,
      ordersData,
    });
  } catch (error) {
    console.log(error);
  }
};
