import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.createCategory(req.body);
  sendResponse(res, { statusCode: 201, success: true, message: "Category created successfully", data: result });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategories();
  sendResponse(res, { statusCode: 200, success: true, message: "Categories retrieved successfully", data: result });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.updateCategory(req.params.id, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: "Category updated successfully", data: result });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params.id);
  sendResponse(res, { statusCode: 200, success: true, message: "Category deleted successfully", data: null });
});

export const categoryController = { createCategory, getAllCategories, updateCategory, deleteCategory };
