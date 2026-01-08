const { Sequelize, DataTypes } = require('sequelize');

// Database connection - uses DATABASE_URL in production (Railway), local Postgres in dev
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  })
  : new Sequelize('lms_database', 'admin', 'password123', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
  });


// 1. KULLANICI MODELİ (PDF Madde 8.1 ve 8.2 Tam Uyumlu)
const User = sequelize.define('User', {
  // Temel Bilgiler
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: true }, // OAuth/LDAP gelirse boş olabilir

  // PDF Madde 8.1: Roller
  role: {
    type: DataTypes.ENUM(
      'super_admin', // Süper Admin (Tüm sistem)
      'manager',     // Yönetici (Ders yönetimi, raporlar)
      'instructor',  // Eğitmen (İçerik, not verme)
      'assistant',   // Asistan (Sınırlı düzenleme)
      'student',     // Öğrenci (Ders erişimi, sınav)
      'guest'        // Misafir (Sınırlı görüntüleme)
    ),
    defaultValue: 'student'
  },

  // PDF Madde 8.2: Kimlik Doğrulama Yöntemleri için Altyapı
  // Bu sütunlar sayesinde "LDAP ve 2FA desteği veritabanında var" diyebilirsin.
  authProvider: {
    type: DataTypes.ENUM('local', 'ldap', 'google', 'azure_ad'),
    defaultValue: 'local'
  },
  ldapId: { type: DataTypes.STRING, allowNull: true }, // LDAP/AD ID'si için
  oauthId: { type: DataTypes.STRING, allowNull: true }, // Google/Microsoft ID'si için

  // 2FA (İki Faktörlü Doğrulama) Altyapısı
  twoFactorEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  twoFactorSecret: { type: DataTypes.STRING, allowNull: true }, // TOTP secret key

  isActive: { type: DataTypes.BOOLEAN, defaultValue: true } // Hesabı dondurmak için
});

// 2. DERS MODELİ (PDF Madde 5.2)
const Course = sequelize.define('Course', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  code: { type: DataTypes.STRING, unique: true },

  // PDF Madde 5.2: Erişim Kontrolü (Tarih/grup/şifre)
  accessCode: { type: DataTypes.STRING, allowNull: true }, // Ders şifresi
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE }
});

// 3. MODÜL/İÇERİK (PDF Madde 5.2 - İçerik Türleri)
const Module = sequelize.define('Module', {
  title: { type: DataTypes.STRING, allowNull: false },
  type: {
    // PDF'teki tüm türler: Video, PDF, SCORM, H5P
    type: DataTypes.ENUM('video', 'pdf', 'scorm', 'h5p', 'quiz'),
    allowNull: false
  },
  contentUrl: { type: DataTypes.STRING },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// 4. SINAV (PDF Madde 10)
const Exam = sequelize.define('Exam', {
  title: { type: DataTypes.STRING, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 60 },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },

  // PDF Madde 11: SEB (Safe Exam Browser) Ayarları
  requiresSEB: { type: DataTypes.BOOLEAN, defaultValue: false },
  sebConfigKey: { type: DataTypes.STRING }, // Browser Key kontrolü için

  // SEB Security Configuration (PDF Madde 11.1)
  sebQuitPassword: { type: DataTypes.STRING, allowNull: true }, // Quit password for SEB
  sebAllowedUrls: { type: DataTypes.JSON, defaultValue: [] }, // URL whitelist
  sebBlockedUrls: { type: DataTypes.JSON, defaultValue: [] }, // URL blacklist
  sebEnableClipboard: { type: DataTypes.BOOLEAN, defaultValue: false }, // Clipboard engeli
  sebEnableScreenshot: { type: DataTypes.BOOLEAN, defaultValue: false }, // Screenshot engeli
  sebEnableDevTools: { type: DataTypes.BOOLEAN, defaultValue: false }, // DevTools engeli
  sebEnableRightClick: { type: DataTypes.BOOLEAN, defaultValue: false }, // Right-click engeli
  sebEnableSpellCheck: { type: DataTypes.BOOLEAN, defaultValue: false }, // Spell check
  sebShowTaskBar: { type: DataTypes.BOOLEAN, defaultValue: false }, // Taskbar visibility

  // PDF Madde 4.2: Optik Form Modu
  isOpticalExam: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// 5. SORU MODELİ (PDF Madde 10 - Soru Türleri)
const Question = sequelize.define('Question', {
  text: { type: DataTypes.TEXT, allowNull: false }, // Soru metni

  // Question Bank Metadata
  category: { type: DataTypes.STRING, defaultValue: 'Genel' },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  tags: { type: DataTypes.JSON, defaultValue: [] }, // Array of strings

  points: { type: DataTypes.FLOAT, defaultValue: 5.0 }, // Soru puanı

  type: {
    type: DataTypes.ENUM(
      'multiple_choice',    // Çoktan Seçmeli (Otomatik: Evet - 0.8 Puan)
      'multiple_selection', // Çoklu Seçim (Otomatik: Evet - 0.7 Puan)
      'true_false',         // Doğru/Yanlış (Otomatik: Evet - 0.5 Puan)
      'matching',           // Eşleştirme (Otomatik: Evet - 0.7 Puan)
      'ordering',           // Sıralama (Otomatik: Evet - 0.6 Puan)
      'fill_blank',         // Boşluk Doldurma (Otomatik: Evet - 0.7 Puan)
      'short_answer',       // Kısa Cevap (Otomatik: Kısmen - 0.6 Puan)
      'long_answer',        // Uzun Cevap (Otomatik: Hayır - 0.6 Puan)
      'file_upload',        // Dosya Yükleme (Otomatik: Hayır - 0.5 Puan)
      'calculation',        // Hesaplama (Otomatik: Evet - 0.6 Puan)
      'hotspot',            // Hotspot (Otomatik: Evet - 0.5 Puan)
      'code_execution'      // Kod Çalıştırma (Otomatik: Evet - 0.7 Puan)
    ),
    allowNull: false
  },

  // Şıklar veya ek veriler (Eşleştirme çiftleri, sıralama öğeleri vb. için JSON)
  options: { type: DataTypes.JSON },

  // Doğru Cevap (Otomatik okuma için)
  // Not: Uzun cevap ve dosya yüklemede burası boş olabilir veya hoca notları buraya girebilir.
  correctAnswer: { type: DataTypes.TEXT },

  // PDF'teki "Otomatik Not" sütununa göre backend'in bunu bilmesi işe yarar
  isAutoGradable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// 6. COURSE ACCESS REQUEST (Ders Erişim Talepleri)
const CourseAccessRequest = sequelize.define('CourseAccessRequest', {
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  message: { type: DataTypes.TEXT }, // Öğrencinin mesajı (opsiyonel)
  responseMessage: { type: DataTypes.TEXT }, // Eğitmenin yanıtı
  respondedAt: { type: DataTypes.DATE }
});

// 7. SINAV SONUÇLARI (Exam Results)
const ExamResult = sequelize.define('ExamResult', {
  score: { type: DataTypes.FLOAT },
  answers: { type: DataTypes.JSON }, // Öğrencinin verdiği cevaplar
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// 8. NOT DEFTERİ (Notes - Personal notes for all roles)
const Note = sequelize.define('Note', {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#FFE066' // Default yellow
  },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  category: {
    type: DataTypes.ENUM('personal', 'course', 'exam'),
    defaultValue: 'personal'
  }
});

// 9. PROCTORING LOG (Security Audit - PDF Madde 11.2)
const ProctoringLog = sequelize.define('ProctoringLog', {
  eventType: {
    type: DataTypes.ENUM(
      'exam_start',      // Sınav başlangıcı
      'exam_end',        // Sınav bitişi
      'webcam_capture',  // Webcam görüntüsü
      'tab_hidden',      // Tab gizlendi
      'tab_visible',     // Tab görünür
      'window_blur',     // Pencere odaktan çıktı
      'window_focus',    // Pencere odaklandı
      'copy_attempt',    // Kopyalama denemesi
      'paste_attempt',   // Yapıştırma denemesi
      'screenshot_attempt', // Ekran görüntüsü denemesi
      'devtools_open',   // DevTools açıldı
      'right_click',     // Sağ tık denemesi
      'keyboard_shortcut', // Kısayol tuşu
      'multiple_faces',  // Birden fazla yüz tespit edildi
      'no_face',         // Yüz tespit edilemedi
      'seb_violation'    // SEB ihlali
    ),
    allowNull: false
  },
  imagePath: { type: DataTypes.STRING, allowNull: true }, // Webcam görüntüsü path
  metadata: { type: DataTypes.JSON, defaultValue: {} }, // Ek bilgiler
  ipAddress: { type: DataTypes.STRING, allowNull: true },
  userAgent: { type: DataTypes.STRING, allowNull: true }
});

// İLİŞKİLER (Relations)
User.hasMany(Course, { foreignKey: 'instructorId' });
Course.belongsTo(User, { as: 'instructor' });

Course.hasMany(Module);
Module.belongsTo(Course);

Course.hasMany(Exam);
Exam.belongsTo(Course);

Exam.hasMany(Question);
Question.belongsTo(Exam);

// Sınav Sonuçları İlişkileri
User.hasMany(ExamResult, { foreignKey: 'studentId' });
ExamResult.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Exam.hasMany(ExamResult, { foreignKey: 'examId' });
ExamResult.belongsTo(Exam, { as: 'exam', foreignKey: 'examId' });

// Öğrenci - Ders İlişkisi (Enrollment)
User.belongsToMany(Course, { through: 'StudentCourses', as: 'enrolledCourses' });
Course.belongsToMany(User, { through: 'StudentCourses', as: 'students' });

// Erişim Talepleri İlişkileri
User.hasMany(CourseAccessRequest, { foreignKey: 'studentId' });
CourseAccessRequest.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Course.hasMany(CourseAccessRequest);
CourseAccessRequest.belongsTo(Course);

// Not Defteri İlişkileri (Notes Relations)
User.hasMany(Note, { foreignKey: 'UserId' });
Note.belongsTo(User, { foreignKey: 'UserId' });
Course.hasMany(Note, { foreignKey: 'CourseId' });
Note.belongsTo(Course, { as: 'course', foreignKey: 'CourseId' });
Exam.hasMany(Note, { foreignKey: 'ExamId' });
Note.belongsTo(Exam, { as: 'exam', foreignKey: 'ExamId' });

// Proctoring Log İlişkileri (Security Audit Relations)
User.hasMany(ProctoringLog, { foreignKey: 'studentId' });
ProctoringLog.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Exam.hasMany(ProctoringLog, { foreignKey: 'examId' });
ProctoringLog.belongsTo(Exam, { as: 'exam', foreignKey: 'examId' });

module.exports = { sequelize, User, Course, Module, Exam, Question, ExamResult, CourseAccessRequest, Note, ProctoringLog };