import { prisma } from "../../lib/prisma";
import ApiError from "../../utils/ApiError";

const createReview = async (
  customerId: string,
  payload: { bookingId: string; rating: number; comment?: string }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true },
  });

  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.customerId !== customerId) {
    throw new ApiError(403, "You can only review your own bookings");
  }
  if (booking.status !== "COMPLETED") {
    throw new ApiError(400, "You can only review a booking after the job is COMPLETED");
  }
  if (booking.review) {
    throw new ApiError(409, "This booking has already been reviewed");
  }

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      customerId,
      technicianId: booking.technicianId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  // Recalculate technician's average rating
  const aggregate = await prisma.review.aggregate({
    where: { technicianId: booking.technicianId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.technicianProfile.update({
    where: { id: booking.technicianId },
    data: {
      avgRating: aggregate._avg.rating || 0,
      totalReviews: aggregate._count.rating,
    },
  });

  return review;
};

export const reviewService = { createReview };
