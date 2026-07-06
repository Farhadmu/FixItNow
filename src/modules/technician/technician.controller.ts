import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { technicianService } from "./technician.service";
import ApiError from "../../utils/ApiError";

const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const { technicians, meta } = await technicianService.getAllTechnicians(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Technicians retrieved successfully",
    meta,
    data: technicians,
  });
});

const getTechnicianById = catchAsync(async (req: Request, res: Response) => {
  const result = await technicianService.getTechnicianById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Technician profile retrieved successfully", data: result });
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await technicianService.updateProfile(req.user.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Profile updated successfully", data: result });
});

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await technicianService.updateAvailability(req.user.id, req.body.slots);
  sendResponse(res, { statusCode: 200, success: true, message: "Availability updated successfully", data: result });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await technicianService.getMyBookings(req.user.id, req.query.status as string | undefined);
  sendResponse(res, { statusCode: 200, success: true, message: "Bookings retrieved successfully", data: result });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await technicianService.updateBookingStatus(req.user.id, req.params.id, req.body.status);
  sendResponse(res, { statusCode: 200, success: true, message: "Booking status updated successfully", data: result });
});

export const technicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateProfile,
  updateAvailability,
  getMyBookings,
  updateBookingStatus,
};
