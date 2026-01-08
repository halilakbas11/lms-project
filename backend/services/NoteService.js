/**
 * Note Service - Single Responsibility: Handle all note-related business logic
 * Following SOLID principles with clear separation of concerns
 */

class NoteService {
    constructor(db) {
        this.Note = db.Note;
        this.User = db.User;
        this.Course = db.Course;
        this.Exam = db.Exam;
    }

    /**
     * Get all notes for a user
     * @param {number} userId - User ID
     * @param {string} category - Optional category filter ('personal', 'course', 'exam')
     */
    async getNotesByUser(userId, category = null) {
        const whereClause = { UserId: userId };
        if (category) {
            whereClause.category = category;
        }

        return await this.Note.findAll({
            where: whereClause,
            include: [
                { model: this.Course, as: 'course', attributes: ['id', 'title', 'code'] },
                { model: this.Exam, as: 'exam', attributes: ['id', 'title'] }
            ],
            order: [
                ['isPinned', 'DESC'],
                ['updatedAt', 'DESC']
            ]
        });
    }

    /**
     * Get a single note by ID
     * @param {number} id - Note ID
     * @param {number} userId - User ID for ownership verification
     */
    async getNoteById(id, userId) {
        const note = await this.Note.findOne({
            where: { id, UserId: userId },
            include: [
                { model: this.Course, as: 'course', attributes: ['id', 'title', 'code'] },
                { model: this.Exam, as: 'exam', attributes: ['id', 'title'] }
            ]
        });

        if (!note) {
            throw new Error('Note not found or access denied');
        }

        return note;
    }

    /**
     * Create a new note
     * @param {Object} noteData - { userId, title, content, color, category, courseId, examId }
     */
    async createNote(noteData) {
        const { userId, title, content, color, category, courseId, examId } = noteData;

        if (!userId || !title) {
            throw new Error('User ID and title are required');
        }

        return await this.Note.create({
            UserId: userId,
            title,
            content: content || '',
            color: color || '#FFE066',
            category: category || 'personal',
            CourseId: category === 'course' ? courseId : null,
            ExamId: category === 'exam' ? examId : null,
            isPinned: false
        });
    }

    /**
     * Update an existing note
     * @param {number} id - Note ID
     * @param {number} userId - User ID for ownership verification
     * @param {Object} updateData - Fields to update
     */
    async updateNote(id, userId, updateData) {
        const note = await this.getNoteById(id, userId);

        const allowedFields = ['title', 'content', 'color', 'category', 'CourseId', 'ExamId'];
        const filteredData = {};

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                filteredData[field] = updateData[field];
            }
        }

        await note.update(filteredData);
        return note;
    }

    /**
     * Toggle pin status of a note
     * @param {number} id - Note ID
     * @param {number} userId - User ID for ownership verification
     */
    async togglePin(id, userId) {
        const note = await this.getNoteById(id, userId);
        await note.update({ isPinned: !note.isPinned });
        return note;
    }

    /**
     * Delete a note
     * @param {number} id - Note ID
     * @param {number} userId - User ID for ownership verification
     */
    async deleteNote(id, userId) {
        const note = await this.getNoteById(id, userId);
        await note.destroy();
        return { success: true, message: 'Note deleted successfully' };
    }

    /**
     * Get note count for a user
     * @param {number} userId - User ID
     */
    async getNoteCount(userId) {
        return await this.Note.count({ where: { UserId: userId } });
    }

    /**
     * Search notes by title or content
     * @param {number} userId - User ID
     * @param {string} query - Search query
     */
    async searchNotes(userId, query) {
        const { Op } = require('sequelize');

        return await this.Note.findAll({
            where: {
                UserId: userId,
                [Op.or]: [
                    { title: { [Op.iLike]: `%${query}%` } },
                    { content: { [Op.iLike]: `%${query}%` } }
                ]
            },
            order: [['updatedAt', 'DESC']]
        });
    }
}

module.exports = NoteService;
