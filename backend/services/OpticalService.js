/**
 * Optical Service - Single Responsibility: Handle optical form reading and grading
 * Following SOLID principles
 */

class OpticalService {
    constructor(db) {
        this.ExamResult = db.ExamResult;
        this.Exam = db.Exam;
        this.Question = db.Question;
        this.User = db.User;
    }

    /**
     * Process optical scan data and calculate score
     * @param {number} examId - Exam ID
     * @param {number} studentId - Student ID
     * @param {Array} scannedAnswers - Array of {questionIndex, selectedOption}
     */
    async processOpticalScan(examId, studentId, scannedAnswers) {
        // Get exam questions
        const questions = await this.Question.findAll({
            where: { examId },
            order: [['id', 'ASC']]
        });

        if (questions.length === 0) {
            throw new Error('No questions found for this exam');
        }

        let correctCount = 0;
        let totalPoints = 0;
        const answerDetails = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const scanned = scannedAnswers.find(a => a.questionIndex === i);
            const userAnswer = scanned?.selectedOption || null;

            totalPoints += question.points || 1;
            const isCorrect = this.checkOpticalAnswer(question, userAnswer);

            if (isCorrect) {
                correctCount++;
            }

            answerDetails.push({
                questionId: question.id,
                questionIndex: i,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                points: question.points || 1
            });
        }

        const score = totalPoints > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

        return {
            score,
            totalQuestions: questions.length,
            correctCount,
            answerDetails
        };
    }

    /**
     * Check optical answer correctness
     */
    checkOpticalAnswer(question, userAnswer) {
        if (!userAnswer) return false;

        // Optical forms typically use A, B, C, D format
        const correctAnswer = question.correctAnswer;

        // Handle both letter format (A, B, C, D) and option object format
        if (typeof correctAnswer === 'string') {
            return userAnswer.toUpperCase() === correctAnswer.toUpperCase();
        }

        return userAnswer === correctAnswer;
    }

    /**
     * Save optical scan result to database
     */
    async saveOpticalResult(examId, studentId, scanResult, instructorId) {
        const existingResult = await this.ExamResult.findOne({
            where: { examId, userId: studentId }
        });

        if (existingResult) {
            // Update existing result
            await existingResult.update({
                score: scanResult.score,
                answers: JSON.stringify(scanResult.answerDetails),
                submittedAt: new Date(),
                gradedBy: instructorId,
                isOptical: true
            });
            return existingResult;
        }

        // Create new result
        return await this.ExamResult.create({
            examId,
            userId: studentId,
            score: scanResult.score,
            answers: JSON.stringify(scanResult.answerDetails),
            submittedAt: new Date(),
            gradedBy: instructorId,
            isOptical: true
        });
    }

    /**
     * Get optical grading history for instructor
     */
    async getOpticalGradingHistory(instructorId) {
        return await this.ExamResult.findAll({
            where: {
                gradedBy: instructorId,
                isOptical: true
            },
            include: [
                { model: this.User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: this.Exam, as: 'exam', attributes: ['id', 'title'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
    }

    /**
     * Validate optical scan image (placeholder for real implementation)
     * In production, this would use computer vision to detect form validity
     */
    validateOpticalImage(imageData) {
        // Placeholder validation
        // Real implementation would check:
        // - Form corners detected
        // - Proper orientation
        // - All answer bubbles visible
        // - No warping/distortion

        return {
            valid: true,
            corners: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 }
            ],
            orientation: 'portrait',
            quality: 'good'
        };
    }

    /**
     * Detect filled bubbles (placeholder for real implementation)
     * In production, this would analyze pixel density in bubble areas
     */
    detectFilledBubbles(imageData, questionCount) {
        // Placeholder - returns simulated detected answers
        // Real implementation would:
        // 1. Locate answer grid on form
        // 2. For each row, check which bubble has highest fill percentage
        // 3. Apply threshold to determine if bubble is filled
        // 4. Handle multiple selections and empty rows

        const mockAnswers = [];
        const options = ['A', 'B', 'C', 'D'];

        for (let i = 0; i < questionCount; i++) {
            // Simulate random detection for demo
            const randomIndex = Math.floor(Math.random() * 4);
            mockAnswers.push({
                questionIndex: i,
                selectedOption: options[randomIndex],
                confidence: 0.85 + Math.random() * 0.15
            });
        }

        return mockAnswers;
    }
}

module.exports = OpticalService;
