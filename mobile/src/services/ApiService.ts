// ApiService - SOLID Principle: Single Responsibility for API Calls
// Clean Architecture: Infrastructure layer for HTTP communication

import axios, { AxiosInstance, AxiosError } from 'axios';

// Configure base URL - use environment variable for production
// For Expo: EXPO_PUBLIC_API_URL
// Default: local development IP
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://lms-project-production-0d23.up.railway.app';

class ApiService {
    private client: AxiosInstance;

    constructor(baseURL: string = API_BASE_URL) {
        this.client = axios.create({
            baseURL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Auth
    async login(email: string, password: string) {
        const response = await this.client.post('/api/login', { email, password });
        return response.data;
    }

    // Student APIs
    async getStudentCourses(userId: number) {
        const response = await this.client.get(`/api/student/${userId}/courses`);
        return response.data;
    }

    async getStudentGrades(userId: number) {
        const response = await this.client.get(`/api/student/${userId}/grades`);
        return response.data;
    }

    // Instructor APIs
    async getInstructorCourses(userId: number) {
        const response = await this.client.get(`/api/instructor/${userId}/courses`);
        return response.data;
    }

    async getInstructorResults(userId: number) {
        const response = await this.client.get(`/api/instructor/${userId}/results`);
        return response.data;
    }

    async getCourseExams(courseId: number) {
        const response = await this.client.get(`/api/exams?courseId=${courseId}`);
        return response.data;
    }

    async getCourseStudents(courseId: number) {
        // Backend uses /api/courses/:id/students for course students
        const response = await this.client.get(`/api/courses/${courseId}/students`);
        return response.data;
    }

    // Exam APIs
    async getExams() {
        const response = await this.client.get('/api/exams');
        return response.data;
    }

    async getExamQuestions(examId: number) {
        const response = await this.client.get(`/api/exams/${examId}/questions`);
        return response.data;
    }

    async submitExam(examId: number, studentId: number, answers: Record<number, string>) {
        const response = await this.client.post(`/api/exams/${examId}/submit`, {
            studentId,
            answers,
        });
        return response.data;
    }

    async saveExamResult(examId: number, studentId: number, score: number, isOptical: boolean = false) {
        const response = await this.client.post('/api/exam-results', {
            examId,
            studentId,
            score,
            isOptical,
        });
        return response.data;
    }

    // Optical Form OMR Analysis - sends image to backend for real analysis
    async submitOpticalForm(examId: number, studentId: number, opticalImage: string) {
        const response = await this.client.post(`/api/exams/${examId}/submit`, {
            studentId,
            opticalImage,
        });
        return response.data;
    }

    // Admin APIs
    async getUsers() {
        const response = await this.client.get('/api/users');
        return response.data;
    }

    async getCourses() {
        const response = await this.client.get('/api/courses');
        return response.data;
    }

    // Notes APIs
    async getNotes(userId: number) {
        const response = await this.client.get(`/api/notes?userId=${userId}`);
        return response.data;
    }

    async createNote(userId: number, title: string, content: string, color: string) {
        const response = await this.client.post('/api/notes', {
            userId,
            title,
            content,
            color,
        });
        return response.data;
    }

    async toggleNotePin(noteId: number) {
        const response = await this.client.patch(`/api/notes/${noteId}/toggle-pin`);
        return response.data;
    }

    async deleteNote(noteId: number) {
        const response = await this.client.delete(`/api/notes/${noteId}`);
        return response.data;
    }

    // JSON Export APIs for Optical Reader
    async exportOpticalResults(examId: number) {
        const response = await this.client.get(`/api/optical-results/export/${examId}`);
        return response.data;
    }

    async exportAllOpticalResults(instructorId: number) {
        const response = await this.client.get(`/api/optical-results/export-all/${instructorId}`);
        return response.data;
    }

    // Progress Tracking APIs
    async saveProgress(userId: number, contentType: 'video' | 'pdf', contentId: string, position: number, duration: number, completed: boolean = false) {
        const response = await this.client.post('/api/progress', {
            userId,
            contentType,
            contentId,
            position,
            duration,
            completed
        });
        return response.data;
    }

    async getProgress(userId: number, contentType: 'video' | 'pdf', contentId: string) {
        const response = await this.client.get(`/api/progress/${userId}/${contentType}/${contentId}`);
        return response.data;
    }

    async getAllProgress(userId: number) {
        const response = await this.client.get(`/api/progress/${userId}`);
        return response.data;
    }

    // Anti-Cheat APIs
    async logAntiCheatEvent(userId: number, examId: number, eventType: string, metadata?: any) {
        const response = await this.client.post('/api/anti-cheat/log', {
            userId,
            examId,
            eventType,
            timestamp: new Date().toISOString(),
            metadata
        });
        return response.data;
    }

    // Utility
    getBaseUrl() {
        return API_BASE_URL;
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
