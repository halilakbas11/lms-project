/**
 * Course Service - Single Responsibility: Handle all course-related business logic
 * Following SOLID principles
 */

class CourseService {
    constructor(db) {
        this.Course = db.Course;
        this.User = db.User;
        this.CourseAccessRequest = db.CourseAccessRequest;
    }

    /**
     * Get all courses with instructor info
     */
    async getAllCourses() {
        return await this.Course.findAll({
            include: [{ model: this.User, as: 'instructor', attributes: ['id', 'name', 'email'] }]
        });
    }

    /**
     * Get course by ID
     */
    async getCourseById(id) {
        return await this.Course.findByPk(id, {
            include: [{ model: this.User, as: 'instructor', attributes: ['id', 'name', 'email'] }]
        });
    }

    /**
     * Get courses by instructor ID
     */
    async getCoursesByInstructor(instructorId) {
        return await this.Course.findAll({
            where: { instructorId },
            include: [{ model: this.User, as: 'instructor', attributes: ['id', 'name', 'email'] }]
        });
    }

    /**
     * Get instructor courses with stats (exam count, student count)
     */
    async getInstructorCoursesWithStats(instructorId, db) {
        const courses = await this.Course.findAll({
            where: { instructorId },
            include: [
                { model: db.Exam, as: 'exams' },
                { model: this.User, as: 'students', through: { attributes: [] } }
            ]
        });

        return courses.map(course => ({
            id: course.id,
            code: course.code,
            title: course.title,
            description: course.description,
            examCount: course.exams ? course.exams.length : 0,
            studentCount: course.students ? course.students.length : 0
        }));
    }

    /**
     * Get enrolled courses for a student
     */
    async getEnrolledCourses(userId) {
        const user = await this.User.findByPk(userId, {
            include: [{
                model: this.Course,
                as: 'enrolledCourses',
                include: [{ model: this.User, as: 'instructor', attributes: ['id', 'name'] }]
            }]
        });

        return user?.enrolledCourses || [];
    }

    /**
     * Create new course
     */
    async createCourse(courseData) {
        return await this.Course.create(courseData);
    }

    /**
     * Update course
     */
    async updateCourse(id, updateData) {
        const course = await this.getCourseById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        await course.update(updateData);
        return course;
    }

    /**
     * Delete course
     */
    async deleteCourse(id) {
        const course = await this.getCourseById(id);
        if (!course) {
            throw new Error('Course not found');
        }

        await course.destroy();
        return { success: true };
    }

    /**
     * Enroll student to course
     */
    async enrollStudent(courseId, userId) {
        const course = await this.getCourseById(courseId);
        const user = await this.User.findByPk(userId);

        if (!course || !user) {
            throw new Error('Course or user not found');
        }

        await course.addStudent(user);
        return { success: true };
    }

    /**
     * Remove student from course
     */
    async removeStudent(courseId, userId) {
        const course = await this.getCourseById(courseId);
        const user = await this.User.findByPk(userId);

        if (!course || !user) {
            throw new Error('Course or user not found');
        }

        await course.removeStudent(user);
        return { success: true };
    }

    /**
     * Get course students
     */
    async getCourseStudents(courseId) {
        const course = await this.Course.findByPk(courseId, {
            include: [{
                model: this.User,
                as: 'students',
                attributes: ['id', 'name', 'email'],
                through: { attributes: [] }
            }]
        });

        return course?.students || [];
    }

    /**
     * Create access request
     */
    async createAccessRequest(userId, courseId) {
        // Check if already enrolled
        const course = await this.getCourseById(courseId);
        const students = await this.getCourseStudents(courseId);

        if (students.some(s => s.id === userId)) {
            throw new Error('Already enrolled in this course');
        }

        // Check for existing pending request
        const existingRequest = await this.CourseAccessRequest.findOne({
            where: { userId, courseId, status: 'pending' }
        });

        if (existingRequest) {
            throw new Error('Request already pending');
        }

        return await this.CourseAccessRequest.create({
            userId,
            courseId,
            status: 'pending'
        });
    }

    /**
     * Get pending access requests for instructor's courses
     */
    async getPendingRequests(instructorId) {
        const courses = await this.getCoursesByInstructor(instructorId);
        const courseIds = courses.map(c => c.id);

        return await this.CourseAccessRequest.findAll({
            where: { courseId: courseIds, status: 'pending' },
            include: [
                { model: this.User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: this.Course, as: 'course', attributes: ['id', 'code', 'title'] }
            ]
        });
    }

    /**
     * Handle access request (approve/reject)
     */
    async handleAccessRequest(requestId, action) {
        const request = await this.CourseAccessRequest.findByPk(requestId);

        if (!request) {
            throw new Error('Request not found');
        }

        if (action === 'approve') {
            await this.enrollStudent(request.courseId, request.userId);
            request.status = 'approved';
        } else {
            request.status = 'rejected';
        }

        await request.save();
        return request;
    }
}

module.exports = CourseService;
