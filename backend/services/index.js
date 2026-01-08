/**
 * Services Index - Dependency Injection container
 * Following SOLID principles - Dependency Inversion
 */

const UserService = require('./UserService');
const CourseService = require('./CourseService');
const ExamService = require('./ExamService');
const OpticalService = require('./OpticalService');
const NoteService = require('./NoteService');
const AdminService = require('./AdminService');

/**
 * Create and initialize all services with database dependency
 * @param {Object} db - Sequelize database instance with models
 * @returns {Object} - Object containing all initialized services
 */
function createServices(db) {
    return {
        userService: new UserService(db),
        courseService: new CourseService(db),
        examService: new ExamService(db),
        opticalService: new OpticalService(db),
        noteService: new NoteService(db),
        adminService: new AdminService(db)
    };
}

module.exports = {
    createServices,
    UserService,
    CourseService,
    ExamService,
    OpticalService,
    NoteService,
    AdminService
};
