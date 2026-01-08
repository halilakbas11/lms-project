/**
 * Mobile App Entry Point
 * Refactored to SOLID Principles & Clean Architecture
 */

import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { styles } from './src/styles/styles';

// Screens
import {
  LoginScreen,
  StudentDashboard,
  InstructorDashboard,
  AdminDashboard,
  OpticalReaderScreen,
  CoursesListScreen,
  ExamsListScreen,
  TakeExamScreen,
  GradesListScreen,
  NotesScreen,
  StudentsListScreen,
  InstructorExamsScreen,
  UsersListScreen,
  AdminCoursesScreen,
  ReportsScreen
} from './src/screens';

// Main App Component
const AppContent = () => {
  const { user, login, logout, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<any>(null); // For passing data between screens if needed
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Navigation Handler
  const navigate = (screen: string) => {
    console.log('Navigating to:', screen);
    setCurrentScreen(screen);
  };

  console.log('App render - loading:', loading, 'user:', user ? 'exists' : 'null');

  if (loading) {
    console.log('Showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!user) {
    console.log('No user, showing login screen');
    return <LoginScreen onLogin={login} />;
  }

  // Routing Logic
  switch (currentScreen) {
    // Optical Reader (Instructor Only)
    case 'optical_reader':
      return <OpticalReaderScreen userId={user.id} onBack={() => navigate('dashboard')} />;

    // Student Screens
    case 'my_courses':
      return <CoursesListScreen userId={user.id} courses={[]} onBack={() => navigate('dashboard')} />; // Note: Courses fetched inside or passed? Refactored to fetch inside.
    case 'my_exams':
      return (
        <ExamsListScreen
          userId={user.id}
          enrolledCourses={[]} // Ideally this should be fetched inside ExamsList now
          onBack={() => navigate('dashboard')}
          onSelectExam={(exam: any) => {
            setSelectedExam(exam);
            navigate('take_exam');
          }}
        />
      );
    case 'take_exam':
      return (
        <TakeExamScreen
          user={user}
          exam={selectedExam}
          onBack={() => navigate('my_exams')}
          onFinish={(result: any) => {
            // navigate('exam_result'); // If we had a result screen separately
            navigate('dashboard');
          }}
        />
      );
    case 'my_grades':
      return <GradesListScreen userId={user.id} onBack={() => navigate('dashboard')} />;
    case 'my_notes':
      return <NotesScreen userId={user.id} onBack={() => navigate('dashboard')} />;

    // Instructor Screens
    case 'instructor_courses':
      return <CoursesListScreen userId={user.id} courses={[]} onBack={() => navigate('dashboard')} />; // Needs adjustment? CoursesList is generic.
    case 'instructor_exams':
      return <InstructorExamsScreen userId={user.id} onBack={() => navigate('dashboard')} />;
    case 'students_list':
      return <StudentsListScreen userId={user.id} onBack={() => navigate('dashboard')} />;
    case 'gradebook':
      // Reuse GradesList or specialized Gradebook?
      // Use helper screen or just alert for now if not implemented fully
      return <InstructorExamsScreen userId={user.id} onBack={() => navigate('dashboard')} />;

    // Admin Screens
    case 'users_list':
      return <UsersListScreen onBack={() => navigate('dashboard')} />;
    case 'courses_list':
      return <AdminCoursesScreen onBack={() => navigate('dashboard')} />;
    case 'reports':
      return <ReportsScreen onBack={() => navigate('dashboard')} />;

    // Dashboards
    case 'dashboard':
    default:
      console.log('Rendering dashboard for user role:', user.role);
      if (user.role === 'student') {
        console.log('Rendering StudentDashboard...');
        return <StudentDashboard user={user} onLogout={logout} onNavigate={navigate} />;
      } else if (user.role === 'instructor') {
        console.log('Rendering InstructorDashboard...');
        return (
          <InstructorDashboard
            user={user}
            onLogout={logout}
            onNavigate={navigate}
            onOpenOptical={() => navigate('optical_reader')}
          />
        );
      } else if (['admin', 'super_admin', 'manager'].includes(user.role)) {
        console.log('Rendering AdminDashboard...');
        return <AdminDashboard user={user} onLogout={logout} onNavigate={navigate} />;
      } else {
        console.log('Unknown role, showing loading indicator');
        return (
          <View style={styles.centerContent}>
            <ActivityIndicator />
          </View>
        );
      }
  }
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
