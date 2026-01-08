/**
 * Middleware Index
 * Export all middleware
 */

const { errorHandler, asyncHandler, notFoundHandler, AppError } = require('./errorHandler');
const {
    validateRequired,
    validateEmail,
    validateId,
    validatePassword,
    validateRole,
    validateExam,
    validateCourse
} = require('./validation');

module.exports = {
    // Error handling
    errorHandler,
    asyncHandler,
    notFoundHandler,
    AppError,

    // Validation
    validateRequired,
    validateEmail,
    validateId,
    validatePassword,
    validateRole,
    validateExam,
    validateCourse
};
