import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const createCategory = async (payload: { name: string; description?: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });
  if (existing) throw new ApiError(409, "Category with this name already exists");
  return prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

const updateCategory = async (id: string, payload: { name?: string; description?: string }) => {
  await getCategoryById(id);
  return prisma.category.update({ where: { id }, data: payload });
};

const deleteCategory = async (id: string) => {
  await getCategoryById(id);
  return prisma.category.delete({ where: { id } });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
