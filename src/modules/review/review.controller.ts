import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { reviewService } from "./review.service";
import ApiError from "../../utils/ApiError";

const createReview = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await reviewService.createReview(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Review submitted successfully", data: result });
});

export const reviewController = { createReview };
