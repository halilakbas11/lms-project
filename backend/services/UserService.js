/**
 * User Service - Single Responsibility: Handle all user-related business logic
 * Following SOLID principles with clear separation of concerns
 */

class UserService {
    constructor(db) {
        this.User = db.User;
    }

    /**
     * Get all users
     */
    async getAllUsers() {
        return await this.User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
    }

    /**
     * Get user by ID
     */
    async getUserById(id) {
        return await this.User.findByPk(id);
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        return await this.User.findOne({ where: { email } });
    }

    /**
     * Get users by role
     */
    async getUsersByRole(role) {
        return await this.User.findAll({
            where: { role },
            attributes: ['id', 'name', 'email', 'role']
        });
    }

    /**
     * Create new user
     */
    async createUser(userData) {
        const { name, email, password, role } = userData;

        // Check if user already exists
        const existingUser = await this.getUserByEmail(email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        return await this.User.create({ name, email, password, role });
    }

    /**
     * Update user
     */
    async updateUser(id, updateData) {
        const user = await this.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }

        await user.update(updateData);
        return user;
    }

    /**
     * Delete user
     */
    async deleteUser(id) {
        const user = await this.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }

        await user.destroy();
        return { success: true };
    }

    /**
     * Authenticate user
     */
    async authenticate(email, password) {
        const user = await this.getUserByEmail(email);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Simple password check (in production, use bcrypt)
        if (user.password !== password) {
            return { success: false, message: 'Invalid password' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }

    /**
     * Get instructors
     */
    async getInstructors() {
        return await this.User.findAll({
            where: { role: 'instructor' },
            attributes: ['id', 'name', 'email']
        });
    }

    /**
     * Get students
     */
    async getStudents() {
        return await this.User.findAll({
            where: { role: 'student' },
            attributes: ['id', 'name', 'email']
        });
    }
}

module.exports = UserService;
