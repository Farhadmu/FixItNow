import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { serviceService } from "./service.service";
import ApiError from "../../utils/ApiError";

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const { services, meta } = await serviceService.getAllServices(req.query as any);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Services retrieved successfully",
    meta,
    data: services,
  });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const result = await serviceService.getServiceById(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Service retrieved successfully", data: result });
});

const createService = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await serviceService.createService(req.user.id, req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Service created successfully", data: result });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  const result = await serviceService.updateService(req.user.id, req.params.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Service updated successfully", data: result });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(401, "Not authorized");
  await serviceService.deleteService(req.user.id, req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Service deleted successfully", data: null });
});

export const serviceController = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
