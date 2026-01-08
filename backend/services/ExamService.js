/**
 * Exam Service - Single Responsibility: Handle all exam-related business logic
 * Following SOLID principles
 */

class ExamService {
    constructor(db) {
        this.Exam = db.Exam;
        this.Question = db.Question;
        this.ExamResult = db.ExamResult;
        this.Course = db.Course;
        this.User = db.User;
    }

    /**
     * Get all exams
     */
    async getAllExams() {
        return await this.Exam.findAll({
            include: [
                { model: this.Course, as: 'course', attributes: ['id', 'code', 'title'] },
                { model: this.Question }
            ]
        });
    }

    /**
     * Get exam by ID with questions
     */
    async getExamById(id) {
        return await this.Exam.findByPk(id, {
            include: [
                { model: this.Course, as: 'course', attributes: ['id', 'code', 'title'] },
                { model: this.Question }
            ]
        });
    }

    /**
     * Get exams for a course
     */
    async getExamsByCourse(courseId) {
        return await this.Exam.findAll({
            where: { courseId },
            include: [{ model: this.Question }]
        });
    }

    /**
     * Get exams for student (enrolled courses only)
     */
    async getExamsForStudent(userId) {
        const user = await this.User.findByPk(userId, {
            include: [{
                model: this.Course,
                as: 'enrolledCourses',
                include: [{
                    model: this.Exam,
                    as: 'exams',
                    include: [{ model: this.Question }]
                }]
            }]
        });

        if (!user?.enrolledCourses) return [];

        const exams = [];
        user.enrolledCourses.forEach(course => {
            if (course.exams) {
                course.exams.forEach(exam => {
                    exams.push({
                        ...exam.toJSON(),
                        courseName: course.title,
                        courseCode: course.code
                    });
                });
            }
        });

        return exams;
    }

    /**
     * Get exam questions only
     */
    async getExamQuestions(examId) {
        return await this.Question.findAll({
            where: { examId }
        });
    }

    /**
     * Create exam
     */
    async createExam(examData) {
        return await this.Exam.create(examData);
    }

    /**
     * Update exam
     */
    async updateExam(id, updateData) {
        const exam = await this.getExamById(id);
        if (!exam) {
            throw new Error('Exam not found');
        }

        await exam.update(updateData);
        return exam;
    }

    /**
     * Delete exam
     */
    async deleteExam(id) {
        const exam = await this.getExamById(id);
        if (!exam) {
            throw new Error('Exam not found');
        }

        await exam.destroy();
        return { success: true };
    }

    /**
     * Add question to exam
     */
    async addQuestion(examId, questionData) {
        const exam = await this.getExamById(examId);
        if (!exam) {
            throw new Error('Exam not found');
        }

        return await this.Question.create({
            ...questionData,
            examId
        });
    }

    /**
     * Submit exam and calculate score
     */
    async submitExam(examId, userId, answers) {
        const exam = await this.getExamById(examId);
        if (!exam) {
            throw new Error('Exam not found');
        }

        const questions = await this.getExamQuestions(examId);
        let score = 0;
        let totalPoints = 0;
        const answerDetails = [];

        for (const question of questions) {
            totalPoints += question.points || 1;
            const userAnswer = answers[question.id];
            const isCorrect = this.checkAnswer(question, userAnswer);

            if (isCorrect) {
                score += question.points || 1;
            }

            answerDetails.push({
                questionId: question.id,
                userAnswer,
                correct: isCorrect
            });
        }

        const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

        // Save result
        const result = await this.ExamResult.create({
            examId,
            userId,
            score: percentage,
            answers: JSON.stringify(answerDetails),
            submittedAt: new Date()
        });

        return {
            resultId: result.id,
            score: percentage,
            totalQuestions: questions.length,
            correctAnswers: answerDetails.filter(a => a.correct).length
        };
    }

    /**
     * Check if answer is correct
     */
    checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;

        const type = question.type;
        const correctAnswer = question.correctAnswer;

        switch (type) {
            case 'multiple_choice':
            case 'true_false':
                return userAnswer === correctAnswer;

            case 'multi_select':
                if (!Array.isArray(userAnswer)) return false;
                const correctOptions = JSON.parse(correctAnswer || '[]');
                return JSON.stringify(userAnswer.sort()) === JSON.stringify(correctOptions.sort());

            case 'fill_blank':
            case 'short_answer':
                return userAnswer.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();

            default:
                return userAnswer === correctAnswer;
        }
    }

    /**
     * Get exam results for a student
     */
    async getStudentResults(userId) {
        return await this.ExamResult.findAll({
            where: { userId },
            include: [{ model: this.Exam, as: 'exam', attributes: ['id', 'title'] }]
        });
    }

    /**
     * Get all results for an exam (for instructor)
     */
    async getExamResults(examId) {
        return await this.ExamResult.findAll({
            where: { examId },
            include: [{ model: this.User, as: 'user', attributes: ['id', 'name', 'email'] }]
        });
    }

    /**
     * Save optical scan result
     */
    async saveOpticalResult(examId, userId, score, answers) {
        return await this.ExamResult.create({
            examId,
            userId,
            score,
            answers: JSON.stringify(answers),
            submittedAt: new Date(),
            isOptical: true
        });
    }

    /**
     * Generate SEB config for exam
     */
    generateSEBConfig(exam) {
        return {
            startURL: `http://localhost:3000/exam/${exam.id}`,
            examKey: Buffer.from(`${exam.id}-${Date.now()}`).toString('base64'),
            allowQuit: false,
            allowSpellCheck: false,
            browserViewMode: 1,
            showTaskBar: false,
            showReloadButton: false,
            showTime: true,
            enableURLFilter: true,
            urlFilterRules: [{ expression: '*', action: 0 }],
            allowedURLPatterns: ['localhost:3000/*'],
        };
    }
}

module.exports = ExamService;
