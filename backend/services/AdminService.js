/**
 * Admin Service - Single Responsibility: Handle all super admin business logic
 * Following SOLID principles with clear separation of concerns
 */

class AdminService {
    constructor(db) {
        this.User = db.User;
        this.Course = db.Course;
        this.Exam = db.Exam;
        this.ExamResult = db.ExamResult;
        this.Note = db.Note;
        this.CourseAccessRequest = db.CourseAccessRequest;
        this.sequelize = db.sequelize;
    }

    /**
     * Get system-wide statistics
     * @returns {Object} - Statistics object with counts
     */
    async getSystemStats() {
        const [
            totalUsers,
            totalCourses,
            totalExams,
            totalNotes,
            totalResults,
            pendingRequests
        ] = await Promise.all([
            this.User.count(),
            this.Course.count(),
            this.Exam.count(),
            this.Note ? this.Note.count() : 0,
            this.ExamResult.count(),
            this.CourseAccessRequest.count({ where: { status: 'pending' } })
        ]);

        return {
            totalUsers,
            totalCourses,
            totalExams,
            totalNotes,
            totalResults,
            pendingRequests
        };
    }

    /**
     * Get role distribution for analytics
     * @returns {Array} - Array of { role, count } objects
     */
    async getRoleDistribution() {
        const roles = ['super_admin', 'manager', 'instructor', 'assistant', 'student', 'guest'];
        const distribution = [];

        for (const role of roles) {
            const count = await this.User.count({ where: { role } });
            distribution.push({ role, count });
        }

        return distribution;
    }

    /**
     * Get recent user registrations
     * @param {number} limit - Number of recent users to fetch
     */
    async getRecentUsers(limit = 10) {
        return await this.User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit
        });
    }

    /**
     * Get course analytics
     * @returns {Object} - Analytics data
     */
    async getCourseAnalytics() {
        const courses = await this.Course.findAll({
            include: [
                { model: this.User, as: 'instructor', attributes: ['id', 'name'] },
                { model: this.User, as: 'students', attributes: ['id'] }
            ]
        });

        const analytics = courses.map(course => ({
            id: course.id,
            title: course.title,
            code: course.code,
            instructor: course.instructor?.name || 'Unassigned',
            studentCount: course.students?.length || 0
        }));

        return analytics;
    }

    /**
     * Get exam statistics
     * @returns {Object} - Exam statistics
     */
    async getExamStats() {
        const exams = await this.Exam.findAll({
            include: [
                { model: this.Course, attributes: ['id', 'title'] }
            ]
        });

        const now = new Date();

        const stats = {
            total: exams.length,
            active: exams.filter(e => e.startTime && new Date(e.startTime) <= now && (!e.endTime || new Date(e.endTime) >= now)).length,
            upcoming: exams.filter(e => e.startTime && new Date(e.startTime) > now).length,
            completed: exams.filter(e => e.endTime && new Date(e.endTime) < now).length,
            draft: exams.filter(e => !e.startTime).length,
            optical: exams.filter(e => e.isOpticalExam).length,
            sebRequired: exams.filter(e => e.requiresSEB).length
        };

        return stats;
    }

    /**
     * Get all pending access requests
     */
    async getPendingRequests() {
        return await this.CourseAccessRequest.findAll({
            where: { status: 'pending' },
            include: [
                { model: this.User, as: 'student', attributes: ['id', 'name', 'email'] },
                { model: this.Course, attributes: ['id', 'title', 'code'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    /**
     * Get comprehensive dashboard data for super admin
     */
    async getDashboardData() {
        const [stats, roleDistribution, recentUsers, examStats, pendingRequests] = await Promise.all([
            this.getSystemStats(),
            this.getRoleDistribution(),
            this.getRecentUsers(5),
            this.getExamStats(),
            this.getPendingRequests()
        ]);

        return {
            stats,
            roleDistribution,
            recentUsers,
            examStats,
            pendingRequests: pendingRequests.slice(0, 5)
        };
    }
}

module.exports = AdminService;
