import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    user: any | null;
    login: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => { },
    logout: async () => { },
    loading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
        // Failsafe: force loading to false after 1 second to prevent stuck loading screen
        const timer = setTimeout(() => {
            console.log('AuthContext: Forcing loading to false after timeout');
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const loadUser = async () => {
        try {
            console.log('AuthContext: Loading user from AsyncStorage...');
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                console.log('AuthContext: User found in storage');
                const parsedUser = JSON.parse(storedUser);
                console.log('AuthContext: User data:', parsedUser);

                // Validate that user has required properties
                if (!parsedUser.role) {
                    console.warn('AuthContext: User object missing role property, clearing storage');
                    await AsyncStorage.removeItem('user');
                    setUser(null);
                } else {
                    setUser(parsedUser);
                }
            } else {
                console.log('AuthContext: No user in storage');
            }
        } catch (e) {
            console.error('AuthContext: Error loading user:', e);
        } finally {
            console.log('AuthContext: Setting loading to false');
            setLoading(false);
        }
    };

    const login = async (userData: any) => {
        try {
            setUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
        } catch (e) {
            console.error(e);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem('user');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
