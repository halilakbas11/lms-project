/**
 * Validation Middleware
 * Input validation following Single Responsibility Principle
 */

const { AppError } = require('./errorHandler');

/**
 * Validate required fields in request body
 */
function validateRequired(fields) {
    return (req, res, next) => {
        const missing = [];

        for (const field of fields) {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            return next(new AppError(`Missing required fields: ${missing.join(', ')}`, 400));
        }

        next();
    };
}

/**
 * Validate email format
 */
function validateEmail(req, res, next) {
    const { email } = req.body;

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new AppError('Invalid email format', 400));
        }
    }

    next();
}

/**
 * Validate ID parameter
 */
function validateId(paramName = 'id') {
    return (req, res, next) => {
        const id = req.params[paramName];

        if (!id || isNaN(parseInt(id))) {
            return next(new AppError(`Invalid ${paramName} parameter`, 400));
        }

        next();
    };
}

/**
 * Validate password strength
 */
function validatePassword(req, res, next) {
    const { password } = req.body;

    if (password && password.length < 3) {
        return next(new AppError('Password must be at least 3 characters', 400));
    }

    next();
}

/**
 * Validate user role
 */
function validateRole(req, res, next) {
    const { role } = req.body;
    const validRoles = ['super_admin', 'manager', 'instructor', 'assistant', 'student', 'guest'];

    if (role && !validRoles.includes(role)) {
        return next(new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400));
    }

    next();
}

/**
 * Validate exam data
 */
function validateExam(req, res, next) {
    const { title, courseId, durationMinutes } = req.body;

    if (title && title.length < 3) {
        return next(new AppError('Exam title must be at least 3 characters', 400));
    }

    if (durationMinutes && (isNaN(durationMinutes) || durationMinutes < 1)) {
        return next(new AppError('Duration must be a positive number', 400));
    }

    next();
}

/**
 * Validate course data
 */
function validateCourse(req, res, next) {
    const { code, title } = req.body;

    if (code && code.length < 2) {
        return next(new AppError('Course code must be at least 2 characters', 400));
    }

    if (title && title.length < 3) {
        return next(new AppError('Course title must be at least 3 characters', 400));
    }

    next();
}

module.exports = {
    validateRequired,
    validateEmail,
    validateId,
    validatePassword,
    validateRole,
    validateExam,
    validateCourse
};
