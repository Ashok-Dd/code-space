import { CodeSpace } from "../models/codeModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/appError.js";

// ✅ Create new code
export const createCode = asyncHandler(async (req, res) => {
  const { id, code } = req.body;

  if (!id || !code) {
    throw new AppError("ID and code are required", 400);
  }

  // Check if ID already exists
  const existing = await CodeSpace.findOne({ id }).lean();
  if (existing) {
    throw new AppError("ID already exists", 409);
  }

  const newCode = await CodeSpace.create({ id, code });

  res.status(201).json({
    success: true,
    message: "Code created successfully",
    data: {
      id: newCode.id,
      createdAt: newCode.createdAt,
    },
  });
});

// ✅ Update existing code
export const updateCode = asyncHandler(async (req, res) => {
  const { id, code } = req.body;

  if (!id || !code) {
    throw new AppError("ID and code are required", 400);
  }

  const updated = await CodeSpace.findOneAndUpdate(
    { id },
    { code, lastAccessed: Date.now() },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new AppError("Code not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Code updated successfully",
    data: {
      id: updated.id,
      updatedAt: updated.updatedAt,
    },
  });
});

// ✅ Get code by ID
export const getCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const codeDoc = await CodeSpace.findOneAndUpdate(
    { id },
    { 
      $inc: { views: 1 },
      lastAccessed: Date.now()
    },
    { new: true }
  ).lean();

  if (!codeDoc) {
    throw new AppError("Code not found", 404);
  }

  // Return plain text for direct code access
  res.status(200).type('text/plain').send(codeDoc.code);
});

// ✅ Check ID availability
export const checkIdAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exists = await CodeSpace.exists({ id });

  res.status(200).json({
    exists: !!exists,
  });
});

// ✅ Delete code (Optional - Add to routes if needed)
export const deleteCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await CodeSpace.findOneAndDelete({ id });

  if (!deleted) {
    throw new AppError("Code not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Code deleted successfully",
  });
});

// ✅ Get code stats (Optional - for analytics)
export const getCodeStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const codeDoc = await CodeSpace.findOne({ id })
    .select('id views createdAt updatedAt lastAccessed')
    .lean();

  if (!codeDoc) {
    throw new AppError("Code not found", 404);
  }

  res.status(200).json({
    success: true,
    data: codeDoc,
  });
});
