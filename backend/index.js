const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const Jimp = require('jimp');
const { sequelize, User, Course, Module, Exam, Question, ExamResult, CourseAccessRequest, Note, ProctoringLog } = require('./db');
const { createServices } = require('./services');

const app = express();

// CORS configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'https://lms-project-git-main-emilias-projects-3e4f0b81.vercel.app', 'https://lms-project-zeta-one.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in development
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' })); // Default limit - resim route'ları için ayrı

// --- SECURITY MIDDLEWARE ---
// Rate limiting - API istek sınırlama
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika
const RATE_LIMIT_MAX = 100; // maksimum istek

// Memory Leak Fix: Her 5 dakikada eski rate limit kayıtlarını temizle
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap) {
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip);
    }
  }
  console.log(`🧹 Rate limit temizlendi. Aktif IP sayısı: ${rateLimitMap.size}`);
}, 5 * 60 * 1000);

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  } else {
    const data = rateLimitMap.get(ip);
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
      rateLimitMap.set(ip, { count: 1, startTime: now });
    } else {
      data.count++;
      if (data.count > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Çok fazla istek. Lütfen bekleyin.' });
      }
    }
  }
  next();
});

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' http://localhost:* https://*.vercel.app https://*.railway.app");
  next();
});

// --- RESİM KAYDETME YARDIMCISI ---
const IMAGES_DIR = path.join(__dirname, 'images');

// 1. Klasör yoksa oluştur
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR);
  console.log('📂 "images" klasörü oluşturuldu.');
}

// 2. Base64 verisini dosyaya çeviren fonksiyon
const saveImage = (base64Data, prefix) => {
  if (!base64Data) return null;

  try {
    // "data:image/jpeg;base64," kısmını temizle
    const base64Image = base64Data.split(';base64,').pop();

    // Benzersiz isim üret: prefix_tarih_rastgele.jpg
    const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const filePath = path.join(IMAGES_DIR, filename);

    // Dosyayı yaz
    fs.writeFileSync(filePath, base64Image, { encoding: 'base64' });
    console.log(`💾 Resim Kaydedildi: ${filename}`);
    return filename;
  } catch (error) {
    console.error('Resim kaydetme hatası:', error);
    return null;
  }
};

// --- ŞİFRE DOĞRULAMA (Madde 8.2 - 0.7 puan) ---
const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az 1 büyük harf içermelidir');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az 1 küçük harf içermelidir');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az 1 rakam içermelidir');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Şifre en az 1 özel karakter içermelidir (!@#$%^&* vb.)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// --- 1. LOGIN API ---
app.post('/api/login', async (req, res) => {
  const { email, password, provider } = req.body;
  try {
    if (provider === 'google') {
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({ name: 'Google User', email, role: 'student', authProvider: 'google' });
      }
      return res.json({ success: true, user });
    }
    const user = await User.findOne({ where: { email } });
    if (user && user.password === password) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Hatalı bilgiler' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 2. TEMEL CRUD İŞLEMLERİ ---
app.get('/api/users', async (req, res) => res.json(await User.findAll()));

// Kullanıcı oluşturma - Şifre doğrulama ile
app.post('/api/users', async (req, res) => {
  try {
    const { password, ...userData } = req.body;

    // Şifre karmaşıklık kontrolü
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Şifre gereksinimleri karşılanmıyor',
        errors: validation.errors
      });
    }

    const user = await User.create({ ...userData, password });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Kullanıcı silme - Kendini silme engeli ile
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { currentUserId } = req.query; // Frontend'den gelen mevcut kullanıcı ID'si

    if (currentUserId && parseInt(currentUserId) === parseInt(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: 'Kendi hesabınızı silemezsiniz!'
      });
    }

    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get('/api/courses', async (req, res) => res.json(await Course.findAll({ include: 'instructor' })));
app.post('/api/courses', async (req, res) => res.json(await Course.create(req.body)));

// --- INSTRUCTOR COURSES (with stats) ---
app.get('/api/instructor/:id/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { instructorId: req.params.id },
      include: ['instructor']
    });

    // Add exam count and student count for each course
    const coursesWithStats = await Promise.all(courses.map(async (course) => {
      const examCount = await Exam.count({ where: { CourseId: course.id } });
      // Student count from enrollments
      const courseWithStudents = await Course.findByPk(course.id, {
        include: [{ model: User, as: 'students' }]
      });
      const studentCount = courseWithStudents?.students?.length || 0;

      return {
        ...course.toJSON(),
        examCount,
        studentCount
      };
    }));

    res.json(coursesWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COURSE MANAGEMENT ENDPOINTS ---

// Update course
app.put('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Ders bulunamadı' });

    await course.update(req.body);
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete course
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Ders bulunamadı' });

    await course.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get course students
app.get('/api/courses/:id/students', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: User, as: 'students', attributes: ['id', 'name', 'email'] }]
    });
    if (!course) return res.status(404).json({ error: 'Ders bulunamadı' });

    res.json(course.students || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove student from course
app.delete('/api/courses/:id/students/:studentId', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Ders bulunamadı' });

    const student = await User.findByPk(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });

    await course.removeStudent(student);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EXAM ENDPOINTS ---

// Get all exams (with optional courseId filter)
app.get('/api/exams', async (req, res) => {
  try {
    const { courseId } = req.query;
    const whereClause = courseId ? { CourseId: courseId } : {};

    const exams = await Exam.findAll({
      where: whereClause,
      include: [{ model: Course, as: 'Course' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(exams);
  } catch (err) {
    console.error('Error fetching exams:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- EXAM MANAGEMENT ENDPOINTS ---

// Update exam
app.put('/api/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Sınav bulunamadı' });

    await exam.update(req.body);
    res.json(exam);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete exam
app.delete('/api/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Sınav bulunamadı' });

    await exam.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DERS ERİŞİM TALEPLERİ SİSTEMİ ---

// Öğrencinin kayıtlı olduğu dersler
app.get('/api/my-courses', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json([]);

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: Course, as: 'enrolledCourses', include: 'instructor' }]
    });
    res.json(user?.enrolledCourses || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Öğrencinin kayıtlı olmadığı dersler (mevcut dersler)
app.get('/api/available-courses', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.json(await Course.findAll({ include: 'instructor' }));

  try {
    const user = await User.findByPk(userId, {
      include: [{ model: Course, as: 'enrolledCourses' }]
    });
    const enrolledIds = user?.enrolledCourses?.map(c => c.id) || [];

    const courses = await Course.findAll({
      where: enrolledIds.length > 0 ? { id: { [require('sequelize').Op.notIn]: enrolledIds } } : {},
      include: 'instructor'
    });

    // Her ders için bekleyen talep var mı kontrol et
    const coursesWithStatus = await Promise.all(courses.map(async (course) => {
      const request = await CourseAccessRequest.findOne({
        where: { studentId: userId, CourseId: course.id },
        order: [['createdAt', 'DESC']]
      });
      return {
        ...course.toJSON(),
        requestStatus: request?.status || null,
        requestId: request?.id || null
      };
    }));

    res.json(coursesWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ders erişim talebi oluştur
app.post('/api/courses/:id/request-access', async (req, res) => {
  const { studentId, message } = req.body;
  const courseId = req.params.id;

  try {
    // Zaten bekleyen talep var mı?
    const existing = await CourseAccessRequest.findOne({
      where: { studentId, CourseId: courseId, status: 'pending' }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Zaten bekleyen bir talebiniz var.' });
    }

    // Zaten kayıtlı mı?
    const user = await User.findByPk(studentId, {
      include: [{ model: Course, as: 'enrolledCourses' }]
    });
    const isEnrolled = user?.enrolledCourses?.some(c => c.id === parseInt(courseId));

    if (isEnrolled) {
      return res.status(400).json({ success: false, message: 'Bu derse zaten kayıtlısınız.' });
    }

    const request = await CourseAccessRequest.create({
      studentId,
      CourseId: courseId,
      message: message || null
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bekleyen talepleri getir (eğitmen/yönetici)
app.get('/api/access-requests', async (req, res) => {
  const { instructorId, status } = req.query;

  try {
    let whereClause = {};
    if (status) whereClause.status = status;

    let requests = await CourseAccessRequest.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Course, include: 'instructor' }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Eğer instructorId verilmişse sadece o eğitmenin derslerine ait talepleri filtrele
    if (instructorId) {
      requests = requests.filter(r => r.Course?.instructorId === parseInt(instructorId));
    }

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Talebe yanıt ver (onayla/reddet)
app.put('/api/access-requests/:id/respond', async (req, res) => {
  const { status, responseMessage } = req.body; // status: 'approved' veya 'rejected'

  try {
    const request = await CourseAccessRequest.findByPk(req.params.id, {
      include: [Course]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Talep bulunamadı.' });
    }

    request.status = status;
    request.responseMessage = responseMessage || null;
    request.respondedAt = new Date();
    await request.save();

    // Eğer onaylandıysa öğrenciyi derse kaydet
    if (status === 'approved') {
      const course = await Course.findByPk(request.CourseId);
      const student = await User.findByPk(request.studentId);
      await course.addStudent(student);
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 3. SINAV SİSTEMİ ---
app.get('/api/exams', async (req, res) => {
  res.json(await Exam.findAll({ include: [Question] }));
});

app.get('/api/results', async (req, res) => {
  const { studentId } = req.query;
  if (!studentId) return res.json([]);
  res.json(await ExamResult.findAll({
    where: { studentId },
    include: [{ model: Exam, as: 'exam' }],
    order: [['createdAt', 'DESC']]
  }));
});

app.get('/api/courses/:courseId/exams', async (req, res) => {
  res.json(await Exam.findAll({ where: { CourseId: req.params.courseId }, include: [Question] }));
});

app.get('/api/exams/:id', async (req, res) => {
  res.json(await Exam.findOne({ where: { id: req.params.id }, include: [Question] }));
});

// Get questions for a specific exam
app.get('/api/exams/:id/questions', async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { ExamId: req.params.id },
      order: [['id', 'ASC']]
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all exams
app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [{ model: Course }, { model: Question }],
      order: [['createdAt', 'DESC']]
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/exams', async (req, res) => res.json(await Exam.create(req.body)));
app.post('/api/questions', async (req, res) => res.json(await Question.create(req.body)));

// --- 4. SEB CONFIG (PDF Madde 11.1 - Comprehensive) ---
app.get('/api/exams/:id/seb-config', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json({ error: 'Sınav bulunamadı' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://lms-project-kvta8qq9l-emilias-projects-3e4f0b81.vercel.app';
    const startURL = `${frontendUrl}/exam/${req.params.id}`;
    const quitURL = `${frontendUrl}/dashboard/student`;

    // URL Filtering Rules
    let urlFilterRules = '';
    if (exam.sebAllowedUrls && exam.sebAllowedUrls.length > 0) {
      exam.sebAllowedUrls.forEach(url => {
        urlFilterRules += `<dict><key>action</key><integer>1</integer><key>expression</key><string>${url}</string><key>regex</key><false/></dict>`;
      });
    }
    if (exam.sebBlockedUrls && exam.sebBlockedUrls.length > 0) {
      exam.sebBlockedUrls.forEach(url => {
        urlFilterRules += `<dict><key>action</key><integer>0</integer><key>expression</key><string>${url}</string><key>regex</key><false/></dict>`;
      });
    }
    // Allow production URLs
    urlFilterRules += `<dict><key>action</key><integer>1</integer><key>expression</key><string>*vercel.app*</string><key>regex</key><false/></dict>`;
    urlFilterRules += `<dict><key>action</key><integer>1</integer><key>expression</key><string>*railway.app*</string><key>regex</key><false/></dict>`;

    // Build comprehensive SEB config
    const xmlConfig = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
    <!-- Basic Settings -->
    <key>startURL</key><string>${startURL}</string>
    <key>sendBrowserExamKey</key><true/>
    <key>examSessionClearCookiesOnStart</key><true/>
    <key>browserViewMode</key><integer>1</integer>
    
    <!-- Quit Settings -->
    <key>allowQuit</key><true/>
    <key>quitURL</key><string>${quitURL}</string>
    ${exam.sebQuitPassword ? `<key>hashedQuitPassword</key><string>${exam.sebQuitPassword}</string>` : ''}
    <key>ignoreExitKeys</key><true/>
    <key>quitURLConfirm</key><false/>
    
    <!-- Security Settings (PDF Madde 11.1) -->
    <key>enableClipboard</key><${exam.sebEnableClipboard ? 'true' : 'false'}/>
    <key>enablePrintScreen</key><${exam.sebEnableScreenshot ? 'true' : 'false'}/>
    <key>allowScreenSharing</key><${exam.sebEnableScreenshot ? 'true' : 'false'}/>
    <key>enablePrivateClipboard</key><false/>
    
    <!-- Keyboard/Input Restrictions -->
    <key>enableF1</key><false/>
    <key>enableF2</key><false/>
    <key>enableF3</key><false/>
    <key>enableF4</key><false/>
    <key>enableF5</key><false/>
    <key>enableF6</key><false/>
    <key>enableF7</key><false/>
    <key>enableF8</key><false/>
    <key>enableF9</key><false/>
    <key>enableF10</key><false/>
    <key>enableF11</key><false/>
    <key>enableF12</key><${exam.sebEnableDevTools ? 'true' : 'false'}/>
    <key>enableAltTab</key><false/>
    <key>enableAltF4</key><false/>
    <key>enableEsc</key><false/>
    <key>enableRightMouse</key><${exam.sebEnableRightClick ? 'true' : 'false'}/>
    <key>enableCtrlEsc</key><false/>
    <key>enableAltEsc</key><false/>
    <key>enableStartMenu</key><false/>
    
    <!-- Browser Window Settings -->
    <key>showTaskBar</key><${exam.sebShowTaskBar ? 'true' : 'false'}/>
    <key>showMenuBar</key><false/>
    <key>showToolbar</key><false/>
    <key>showReloadButton</key><false/>
    <key>showTime</key><true/>
    <key>showInputLanguage</key><false/>
    <key>enableZoomPage</key><false/>
    <key>enableZoomText</key><false/>
    <key>zoomMode</key><integer>0</integer>
    <key>allowSpellCheck</key><${exam.sebEnableSpellCheck ? 'true' : 'false'}/>
    <key>allowDictionaryLookup</key><false/>
    
    <!-- Navigation -->
    <key>allowBrowsingBackForward</key><false/>
    <key>newBrowserWindowByLinkPolicy</key><integer>0</integer>
    <key>newBrowserWindowByScriptPolicy</key><integer>0</integer>
    <key>mainBrowserWindowWidth</key><string>100%</string>
    <key>mainBrowserWindowHeight</key><string>100%</string>
    <key>mainBrowserWindowPositioning</key><integer>1</integer>
    
    <!-- URL Filtering -->
    <key>URLFilterEnable</key><true/>
    <key>URLFilterEnableContentFilter</key><false/>
    <key>URLFilterRules</key><array>${urlFilterRules}</array>
    
    <!-- Proctoring Support -->
    <key>allowVideoCapture</key><true/>
    <key>allowAudioCapture</key><true/>
    <key>allowUseOfCamera</key><true/>
    
    <!-- Additional Security -->
    <key>detectStoppedProcess</key><true/>
    <key>allowVirtualMachine</key><false/>
    <key>allowSiri</key><false/>
    <key>allowDictation</key><false/>
    
    <!-- Exam Key (for validation) -->
    ${exam.sebConfigKey ? `<key>browserExamKey</key><string>${exam.sebConfigKey}</string>` : ''}
</dict></plist>`;

    res.setHeader('Content-Type', 'application/seb');
    res.setHeader('Content-Disposition', `attachment; filename="sinav_${req.params.id}.seb"`);
    res.send(xmlConfig);
  } catch (err) {
    console.error('SEB config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- 5. SINAV ANLIK LOGLAMA (PROCTORING - PDF Madde 11.2) ---
// Webcam görüntüleri her 5 saniyede bir kaydedilir
app.post('/api/exams/log', express.json({ limit: '10mb' }), async (req, res) => {
  const { studentId, examId, imageSnapshot, eventType } = req.body;

  try {
    let filename = null;

    // Görüntü varsa kaydet
    if (imageSnapshot) {
      filename = saveImage(imageSnapshot, `proctor_s${studentId}_e${examId}`);
    }

    // ProctoringLog'a kaydet
    await ProctoringLog.create({
      studentId,
      examId,
      eventType: eventType || 'webcam_capture',
      imagePath: filename,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: { timestamp: new Date().toISOString() }
    });

    res.json({ success: true, savedAs: filename });
  } catch (err) {
    console.error('Proctoring log error:', err);
    res.json({ success: true }); // Fail silently for proctoring
  }
});

// --- 5.1. SECURITY VIOLATION LOGGING (PDF Madde 11.1 - Client-side violations) ---
app.post('/api/exams/:id/security-violation', express.json(), async (req, res) => {
  const { studentId, eventType, metadata } = req.body;
  const examId = req.params.id;

  try {
    await ProctoringLog.create({
      studentId,
      examId,
      eventType,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: metadata || {}
    });

    console.log(`🚨 Security Violation: Student ${studentId}, Exam ${examId}, Event: ${eventType}`);
    res.json({ success: true, logged: true });
  } catch (err) {
    console.error('Security violation log error:', err);
    res.json({ success: true }); // Fail silently
  }
});

// --- 5.2. GET PROCTORING LOGS (For instructor review) ---
app.get('/api/exams/:id/proctoring-logs', async (req, res) => {
  try {
    const logs = await ProctoringLog.findAll({
      where: { examId: req.params.id },
      include: [{ model: User, as: 'student', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 500
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5.3. GET VIOLATION SUMMARY (For exam security report) ---
app.get('/api/exams/:id/security-summary', async (req, res) => {
  try {
    const logs = await ProctoringLog.findAll({
      where: { examId: req.params.id },
      attributes: ['studentId', 'eventType'],
      include: [{ model: User, as: 'student', attributes: ['id', 'name'] }]
    });

    // Group violations by student
    const summary = {};
    logs.forEach(log => {
      if (!summary[log.studentId]) {
        summary[log.studentId] = {
          student: log.student,
          violations: {},
          totalViolations: 0
        };
      }
      if (log.eventType !== 'webcam_capture' && log.eventType !== 'exam_start' && log.eventType !== 'exam_end') {
        summary[log.studentId].violations[log.eventType] = (summary[log.studentId].violations[log.eventType] || 0) + 1;
        summary[log.studentId].totalViolations++;
      }
    });

    res.json(Object.values(summary).filter(s => s.totalViolations > 0));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 6. SINAV TESLİMİ (OPTİK & KLASİK) ---
// NOT: Optik form resmi için 10mb limit

// ===== PERSPEKTİF DÜZELTME YARDIMCI FONKSİYONLARI =====

/**
 * Köşe Tespiti (Corner Detection)
 * Form köşelerini bulmak için kenar taraması yapar
 */
function detectFormCorners(image) {
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  const corners = { topLeft: null, topRight: null, bottomLeft: null, bottomRight: null, detected: false };

  // Köşe arama fonksiyonu - koyu pikseller arar
  const findDarkPixel = (startX, startY, dirX, dirY, maxSteps) => {
    for (let step = 0; step < maxSteps; step++) {
      const x = Math.floor(startX + (step * dirX));
      const y = Math.floor(startY + (step * dirY));

      if (x < 0 || x >= width || y < 0 || y >= height) break;

      const idx = (y * width + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      const brightness = (r + g + b) / 3;

      // Koyu piksel bulundu (form kenarı veya köşe işareti)
      if (brightness < 80) {
        return { x, y, found: true };
      }
    }
    return { x: startX, y: startY, found: false };
  };

  // 4 köşeyi tara
  const margin = Math.min(width, height) * 0.15; // %15 marj

  // Sol üst köşe
  const tl = findDarkPixel(margin, margin, 1, 1, 50);
  if (tl.found) corners.topLeft = tl;

  // Sağ üst köşe
  const tr = findDarkPixel(width - margin, margin, -1, 1, 50);
  if (tr.found) corners.topRight = tr;

  // Sol alt köşe
  const bl = findDarkPixel(margin, height - margin, 1, -1, 50);
  if (bl.found) corners.bottomLeft = bl;

  // Sağ alt köşe
  const br = findDarkPixel(width - margin, height - margin, -1, -1, 50);
  if (br.found) corners.bottomRight = br;

  // En az 2 köşe bulunmuşsa tespit başarılı
  const foundCount = [corners.topLeft, corners.topRight, corners.bottomLeft, corners.bottomRight].filter(c => c).length;
  corners.detected = foundCount >= 2;

  console.log(`🔍 Köşe Tespiti: ${foundCount}/4 köşe bulundu`);
  return corners;
}

/**
 * Eğiklik Açısı Hesaplama
 * Bulunan köşelerden form eğikliğini hesaplar
 */
function calculateSkewAngle(corners) {
  let angle = 0;
  let measurements = 0;

  // Üst kenar eğikliği
  if (corners.topLeft && corners.topRight) {
    const dx = corners.topRight.x - corners.topLeft.x;
    const dy = corners.topRight.y - corners.topLeft.y;
    angle += Math.atan2(dy, dx) * (180 / Math.PI);
    measurements++;
  }

  // Alt kenar eğikliği
  if (corners.bottomLeft && corners.bottomRight) {
    const dx = corners.bottomRight.x - corners.bottomLeft.x;
    const dy = corners.bottomRight.y - corners.bottomLeft.y;
    angle += Math.atan2(dy, dx) * (180 / Math.PI);
    measurements++;
  }

  // Sol kenar eğikliği (90° olmalı)
  if (corners.topLeft && corners.bottomLeft) {
    const dx = corners.bottomLeft.x - corners.topLeft.x;
    const dy = corners.bottomLeft.y - corners.topLeft.y;
    const verticalAngle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;
    angle += verticalAngle;
    measurements++;
  }

  // Ortalama eğiklik açısı
  if (measurements > 0) {
    angle = angle / measurements;
  }

  return angle;
}

// ORTHODOX OMR: Görüntü Analizi ve Cevap Okuma (Error Tolerance// --- 6. OPTİK FORM İŞLEME PROTOTİPİ (Jimp ile) ---
async function analyzeAndReadForm(base64Image, questionCount = 10) {
  return new Promise((resolve, reject) => {
    try {
      const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

      Jimp.read(buffer)
        .then(async image => {
          // ===== PERSPEKTİF DÜZELTME (İPTAL EDİLDİ - User Request) =====
          // Kullanıcı "resim yamuluyor" dediği için iptal ettik. 
          // Artık direkt çekilen resim işlenecek.

          /*
          // 1. Köşe Tespiti (Corner Detection)
          const corners = detectFormCorners(image);

          // 2. Eğiklik açısını hesapla ve düzelt
          if (corners.detected) {
            const skewAngle = calculateSkewAngle(corners);
            if (Math.abs(skewAngle) > 1 && Math.abs(skewAngle) < 45) {
              console.log(`📐 Perspektif Düzeltme: ${skewAngle.toFixed(2)}° döndürülüyor`);
              image.rotate(-skewAngle, false); // Eğikliği düzelt
            }
          }
          */

          // 3. Standart boyuta getir (İPTAL - Orijinal çözünürlük kullan)
          // image.resize(600, 800); 

          const width = image.bitmap.width;
          const height = image.bitmap.height;

          console.log(`📏 Görüntü Boyutu: ${width}x${height}`);

          let totalBrightness = 0;
          let totalSaturation = 0;
          let whitePixels = 0;
          let colorfulPixels = 0;

          // ... (brightness/saturation loops tailored for dynamic size could go here but skipping for brevity as they are sampling) ...
          // Using a smaller sample scan for performance
          image.scan(0, 0, width, height, function (x, y, idx) {
            if (x % 20 !== 0 || y % 20 !== 0) return; // Sample less frequently for large images
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            const brightness = (r + g + b) / 3;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;

            totalBrightness += brightness;
            totalSaturation += saturation;

            // ERROR TOLERANCE: Daha gevşek beyaz algılama eşiği
            if (brightness > 80 && saturation < 0.25) whitePixels++;
            if (saturation > 0.20) colorfulPixels++;
          });

          // ERROR TOLERANCE: Kalite kontrollerini devre dışı bırakıyoruz (User Request)
          // Her türlü görüntüyü işlemeye çalışacağız.
          let qualityScore = 100;
          const warnings = [];

          /*
          if (colorfulRatio > 0.45) {
            resolve({ valid: false, reason: `Görüntü optik form gibi görünmüyor (Renk: %${(colorfulRatio * 100).toFixed(0)})`, errorCode: 'INVALID_MATERIAL' });
            return;
          } else if (colorfulRatio > 0.30) {
            warnings.push('Görüntüde fazla renk var');
            qualityScore -= 20;
          }

          if (avgBrightness < 25) {
            resolve({ valid: false, reason: "Ortam çok karanlık. Işığı artırın.", errorCode: 'TOO_DARK' });
            return;
          } else if (avgBrightness < 40) {
            warnings.push('Düşük ışık algılandı');
            qualityScore -= 15;
          }

          if (whiteRatio < 0.05) {
            resolve({ valid: false, reason: "Kağıt algılanamadı. Formu düz yüzeye koyun.", errorCode: 'NO_PAPER' });
            return;
          } else if (whiteRatio < 0.10) {
            warnings.push('Kağıt alanı küçük');
            qualityScore -= 10;
          }

          // ERROR TOLERANCE: Kısmi okuma - en az %30 veya 1 soru okunmalı
          const minRequired = Math.max(1, Math.floor(questionCount * 0.3));
          if (questionsRead < minRequired) {
             // DEVAM ET - Hataya düşürme, boş da olsa sonuç dön.
             // resolve({ valid: false, reason: `Yeterli cevap algılanamadı (${questionsRead}/${questionCount})`, errorCode: 'INSUFFICIENT_ANSWERS', partialAnswers: answers });
             // return;
          }
          */
          // Matches Mobile Overlay: Left 33.3%, Top 25%, Width 30%, Height 67.5%

          const startX = width * 0.333;
          const startY = height * 0.25;
          const gridWidth = width * 0.30;
          const gridHeight = height * 0.675;

          // 5 columns (4 gaps), 10 rows (9 gaps) - roughly
          // Actually we need to fit 5 options IN the gridWidth.
          const gapX = gridWidth / 4;

          // We need to fit 10 questions IN the gridHeight
          const gapY = gridHeight / 9;

          // Dynamic Bubble Size: ~40% of the gap
          const scanSize = Math.floor(Math.min(gapX, gapY) * 0.4);

          console.log(`📐 Grid: Start(${startX.toFixed(0)},${startY.toFixed(0)}) Gap(${gapX.toFixed(0)},${gapY.toFixed(0)}) ScanSize(${scanSize})`);

          const answers = {};
          const confidences = {};

          let totalConfidence = 0;
          let questionsRead = 0;

          // Use provided questionCount
          for (let q = 1; q <= questionCount; q++) {
            let detectedOption = null;
            let minBrightness = 255;
            let secondMinBrightness = 255;

            ['A', 'B', 'C', 'D', 'E'].forEach((opt, idx) => {
              const bubbleX = Math.floor(startX + (idx * gapX));
              const bubbleY = Math.floor(startY + ((q - 1) * gapY));

              let zoneBright = 0;
              let pixels = 0;

              // Boundary check for scan
              if (bubbleX >= 0 && bubbleY >= 0 && bubbleX + scanSize < width && bubbleY + scanSize < height && scanSize > 0) {
                image.scan(bubbleX, bubbleY, scanSize, scanSize, function (x, y, idx) {
                  const r = this.bitmap.data[idx + 0];
                  zoneBright += r;
                  pixels++;
                });
              } else {
                console.warn(`⚠️ OMR Scan Out of Bounds: x=${bubbleX} y=${bubbleY} size=${scanSize}`);
              }

              const avgres = pixels > 0 ? zoneBright / pixels : 255;
              // ... existing logic ...

              if (avgres < minBrightness) {
                secondMinBrightness = minBrightness;
                minBrightness = avgres;
                if (avgres < 130) { // ERROR TOLERANCE: 120->130
                  detectedOption = opt;
                }
              } else if (avgres < secondMinBrightness) {
                secondMinBrightness = avgres;
              }
            });

            if (detectedOption) {
              answers[q] = detectedOption;
              const diff = secondMinBrightness - minBrightness;
              confidences[q] = Math.min(100, Math.round((diff / 50) * 100));
              totalConfidence += confidences[q];
              questionsRead++;
            } else {
              answers[q] = null;
              confidences[q] = 0;
            }
          }

          // ERROR TOLERANCE: Kısmi okuma - en az %30 veya 1 soru okunmalı
          const minRequired = Math.max(1, Math.floor(questionCount * 0.3));
          if (questionsRead < minRequired) {
            resolve({ valid: false, reason: `Yeterli cevap algılanamadı (${questionsRead}/${questionCount})`, errorCode: 'INSUFFICIENT_ANSWERS', partialAnswers: answers });
            return;
          }

          // --- DEBUG VISUALIZATION ---
          // Draw boxes around scanned zones to help user align camera
          for (let q = 1; q <= questionCount; q++) {
            ['A', 'B', 'C', 'D', 'E'].forEach((opt, idx) => {
              const bubbleX = Math.floor(startX + (idx * gapX));
              const bubbleY = Math.floor(startY + ((q - 1) * gapY));

              // Color: Green if this was the selected answer, Red otherwise
              const color = (answers[q] === opt) ? 0x00FF00FF : 0xFF0000FF;

              // Simple box drawing (borders only)
              // Ensure we don't draw outside image bounds
              if (bubbleX >= 0 && bubbleY >= 0 && bubbleX + scanSize < width && bubbleY + scanSize < height) {
                for (let i = 0; i < scanSize; i++) {
                  image.setPixelColor(color, bubbleX + i, bubbleY); // Top
                  image.setPixelColor(color, bubbleX + i, bubbleY + scanSize - 1); // Bottom
                  image.setPixelColor(color, bubbleX, bubbleY + i); // Left
                  image.setPixelColor(color, bubbleX + scanSize - 1, bubbleY + i); // Right
                }
              }
            });
          }

          image.getBase64(Jimp.MIME_JPEG, (err, debugBase64) => {
            if (err) console.error("Debug image generation failed", err);

            console.log("Detect Answers:", answers);
            console.log(`Questions Read: ${questionsRead}/${questionCount}`);

            resolve({
              valid: true,
              answers,
              debugImage: debugBase64, // Return the annotated image
              metadata: { questionsRead, avgConfidence: Math.round(totalConfidence / questionsRead), qualityScore, warnings, confidences }
            });
          });

        })

        .catch(err => {
          console.error("Jimp Processing Error:", err);
          // Return the ACTUAL error message for debugging
          resolve({ valid: false, reason: "Görüntü işleme hatası: " + (err.message || err), errorCode: 'PROCESSING_ERROR' });
        });

    } catch (err) {
      resolve({ valid: false, reason: `Sistem hatası: ${err.message}`, errorCode: 'SYSTEM_ERROR' });
    }
  });
}


// --- 7. PROCTORING (GÜVENLİK LOGLARI) ---
app.post('/api/exams/log', express.json({ limit: '5mb' }), async (req, res) => {
  const { studentId, examId, imageSnapshot } = req.body;

  if (imageSnapshot) {
    const filename = saveImage(imageSnapshot, `log_s${studentId}_e${examId}_${Date.now()}`);
    console.log(`🔒 Güvenlik Kaydı Alındı: ${filename}`);
  }

  res.json({ success: true });
});

app.post('/api/exams/:id/submit', express.json({ limit: '10mb' }), async (req, res) => {
  const { studentId, answers, opticalImage } = req.body;

  try {
    if (opticalImage) {
      console.log(`📸 Optik Form Analizi Başlıyor: Öğrenci ${studentId}`);

      // ÖNCE SINAVI ÇEK (Soru sayısını öğrenmek için)
      const exam = await Exam.findByPk(req.params.id, { include: [Question] });
      if (!exam) return res.status(404).json({ success: false, message: 'Sınav bulunamadı' });

      // En fazla 10 soru destekliyoruz (Mobil arayüzdeki grid yapısı 10 satırlı)
      let questionCount = Math.min(exam.Questions.length, 10);

      console.log(`📊 Veritabanındaki Soru Sayısı: ${exam.Questions.length}`);

      // Eğer hiç soru yoksa (Demo/Test modu) varsayılan 10 yap
      if (questionCount === 0) {
        console.log("⚠️ Sınavda soru bulunamadı, varsayılan 10 soru taranacak.");
        questionCount = 10;
      }

      // Görüntüyü gerçek analizden geçir ve OKU (Dinamik soru sayısı ile)
      const analysis = await analyzeAndReadForm(opticalImage, questionCount);

      if (!analysis.valid) {
        console.log(`❌ Analiz Başarısız: ${analysis.reason}`);
        return res.status(400).json({ success: false, message: analysis.reason });
      }

      // Başarılı ise kaydet
      const filename = saveImage(opticalImage, `optical_s${studentId}_e${req.params.id}`);

      // ORTHODOX PUANLAMA (Okunan cevapları doğru cevaplarla karşılaştır)
      const detectedAnswers = analysis.answers || {};

      let earnedPoints = 0;
      let totalPoints = 0;

      // Soru sayısı kadar döngü
      exam.Questions.slice(0, questionCount).forEach((q, idx) => {
        const qNum = idx + 1; // 1-based index
        totalPoints += q.points;

        // Okunan cevap var mı?
        if (detectedAnswers[qNum] && detectedAnswers[qNum] === q.correctAnswer) {
          earnedPoints += q.points;
        }
      });

      // Eğer soru yoksa veya okunamadıysa min puan ver (Demo için)
      let finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      finalScore = Math.round(finalScore);

      console.log(`📝 Notlandırma: Okunan=${JSON.stringify(detectedAnswers)} Puan=${finalScore}`);

      await ExamResult.create({
        studentId,
        examId: req.params.id,
        score: finalScore,
        answers: { optical: true, detected: detectedAnswers, image: filename }
      });

      return res.json({
        success: true,
        score: finalScore,
        answers: detectedAnswers,
        debugImage: analysis.debugImage, // <--- Add this
        message: `Optik form başarıyla doğrulandı. Puan: ${finalScore}`
      });
    }

    // Klasik/Online Test
    // Puanlama mantığı
    const exam = await Exam.findByPk(req.params.id, { include: [Question] });
    let earnedPoints = 0;
    let totalPoints = 0;

    exam.Questions.forEach(q => {
      totalPoints += q.points;
      // Cevap kontrolü (Basit eşitlik)
      if (answers && answers[q.id] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });

    // Puanı 100 üzerinden hesapla (eğer soru puanları 100 etmiyorsa)
    let finalScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    finalScore = Math.round(finalScore);

    // Sonucu Kaydet
    await ExamResult.create({
      studentId,
      examId: req.params.id,
      score: finalScore,
      answers: answers
    });

    res.json({ success: true, score: finalScore, message: 'Sınav tamamlandı.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Sınav kaydedilirken hata oluştu.' });
  }
});

// ==================== INSTRUCTOR OPTICAL GRADING ====================

// Get students for a specific course (for instructor to select)
app.get('/api/instructor/courses/:courseId/students', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId, {
      include: [{
        model: User,
        as: 'students',
        attributes: ['id', 'name', 'email'],
        through: { attributes: [] }
      }]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course.students || []);
  } catch (err) {
    console.error('Error fetching course students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get exams for a course (for instructor to select for optical grading)
app.get('/api/instructor/courses/:courseId/exams', async (req, res) => {
  try {
    const exams = await Exam.findAll({
      where: { CourseId: req.params.courseId },
      include: [{ model: Question }]
    });

    res.json(exams);
  } catch (err) {
    console.error('Error fetching course exams:', err);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Submit optical scan result for a specific student
app.post('/api/instructor/optical-grade', async (req, res) => {
  try {
    const { examId, studentId, instructorId, answers, score } = req.body;

    if (!examId || !studentId || !instructorId) {
      return res.status(400).json({ error: 'Missing required fields: examId, studentId, instructorId' });
    }

    // Verify exam exists
    const exam = await Exam.findByPk(examId, { include: [Question] });
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Verify student exists
    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate score if not provided
    let finalScore = score;
    if (finalScore === undefined && answers) {
      let correctCount = 0;
      const questions = exam.Questions || [];

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const userAnswer = answers[i] || answers[q.id] || null;

        if (userAnswer && userAnswer === q.correctAnswer) {
          correctCount++;
        }
      }

      finalScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    }

    // Check for existing result and update or create
    let result = await ExamResult.findOne({
      where: { examId, studentId }
    });

    if (result) {
      await result.update({
        score: finalScore,
        answers: JSON.stringify(answers || {}),
        gradedBy: instructorId,
        isOptical: true
      });
    } else {
      result = await ExamResult.create({
        examId,
        studentId,
        score: finalScore,
        answers: JSON.stringify(answers || {}),
        gradedBy: instructorId,
        isOptical: true
      });
    }

    res.json({
      success: true,
      score: finalScore,
      studentName: student.name,
      examTitle: exam.title,
      message: `Başarıyla kaydedildi: ${student.name} - ${exam.title} - Puan: ${finalScore}`
    });
  } catch (err) {
    console.error('Error saving optical grade:', err);
    res.status(500).json({ error: 'Failed to save optical grade' });
  }
});

// Get exam results for instructor (all students for a specific exam)
app.get('/api/instructor/exams/:examId/results', async (req, res) => {
  try {
    const results = await ExamResult.findAll({
      where: { examId: req.params.examId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Exam, as: 'exam', attributes: ['id', 'title'] }
      ]
    });

    res.json(results);
  } catch (err) {
    console.error('Error fetching exam results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get all results for an instructor's courses
app.get('/api/instructor/:instructorId/results', async (req, res) => {
  try {
    // Get all ExamResults for exams in instructor's courses
    const courses = await Course.findAll({
      where: { instructorId: req.params.instructorId },
      attributes: ['id', 'title', 'code']
    });

    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return res.json([]);
    }

    // Get exams for these courses
    const exams = await Exam.findAll({
      where: { CourseId: { [require('sequelize').Op.in]: courseIds } },
      attributes: ['id', 'title', 'CourseId']
    });

    const examIds = exams.map(e => e.id);

    if (examIds.length === 0) {
      return res.json([]);
    }

    // Get results for these exams
    const results = await ExamResult.findAll({
      where: { examId: { [require('sequelize').Op.in]: examIds } },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Exam, as: 'exam', attributes: ['id', 'title', 'CourseId'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Map results with course info
    const courseMap = {};
    courses.forEach(c => { courseMap[c.id] = c; });

    const examCourseMap = {};
    exams.forEach(e => { examCourseMap[e.id] = e.CourseId; });

    const allResults = results.map(result => ({
      id: result.id,
      score: result.score,
      isOptical: result.isOptical || false,
      submittedAt: result.submittedAt || result.createdAt,
      student: result.student,
      exam: { id: result.exam.id, title: result.exam.title },
      course: courseMap[result.exam.CourseId] || { id: 0, title: 'Unknown', code: 'N/A' }
    }));

    res.json(allResults);
  } catch (err) {
    console.error('Error fetching instructor results:', err);
    res.status(500).json({ error: 'Failed to fetch results', details: err.message });
  }
});

// ==================== EXAM RESULTS API (Optical Grading) ====================

// Create exam result (for optical reader grading)
app.post('/api/exam-results', async (req, res) => {
  const { examId, studentId, score, isOptical } = req.body;

  if (!examId || !studentId || score === undefined) {
    return res.status(400).json({ error: 'examId, studentId, and score are required' });
  }

  try {
    // Check if result already exists for this student and exam
    const existing = await ExamResult.findOne({
      where: { examId, studentId }
    });

    if (existing) {
      // Update existing result
      existing.score = score;
      existing.isOptical = isOptical || false;
      existing.submittedAt = new Date();
      await existing.save();
      return res.json({ success: true, message: 'Grade updated', result: existing });
    }

    // Create new result
    const result = await ExamResult.create({
      examId,
      studentId,
      score,
      isOptical: isOptical || false,
      submittedAt: new Date()
    });

    res.status(201).json({ success: true, message: 'Grade saved', result });
  } catch (err) {
    console.error('Error saving exam result:', err);
    res.status(500).json({ error: 'Failed to save grade' });
  }
});

// ==================== STUDENT GRADES API ====================

// Get all grades for a student
app.get('/api/student/:userId/grades', async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await ExamResult.findAll({
      where: { studentId: userId },
      include: [
        {
          model: Exam,
          as: 'exam',
          attributes: ['id', 'title', 'durationMinutes'],
          include: [{
            model: Course,
            attributes: ['id', 'title', 'code']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format the results
    const grades = results.map(result => ({
      id: result.id,
      examId: result.exam?.id,
      examTitle: result.exam?.title || 'Unknown Exam',
      courseCode: result.exam?.Course?.code || 'N/A',
      courseName: result.exam?.Course?.title || 'Unknown Course',
      score: result.score,
      maxScore: 100, // Assuming 100 as max score
      submittedAt: result.submittedAt || result.createdAt,
      status: result.score !== null ? 'graded' : 'pending'
    }));

    res.json(grades);
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

// ==================== JSON EXPORT API (Optik Okuyucu Sonuçları) ====================

// Export single exam results as JSON
app.get('/api/optical-results/export/:examId', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.examId, {
      include: [{ model: Course, attributes: ['id', 'title', 'code'] }]
    });

    if (!exam) {
      return res.status(404).json({ error: 'Sınav bulunamadı' });
    }

    const results = await ExamResult.findAll({
      where: { examId: req.params.examId },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: 'optical_reader_results',
      exam: {
        id: exam.id,
        title: exam.title,
        courseCode: exam.Course?.code || 'N/A',
        courseName: exam.Course?.title || 'Unknown'
      },
      summary: {
        totalStudents: results.length,
        averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length) : 0,
        opticalScans: results.filter(r => r.isOptical).length,
        onlineSubmissions: results.filter(r => !r.isOptical).length
      },
      results: results.map(r => ({
        studentId: r.student?.id,
        studentName: r.student?.name,
        studentEmail: r.student?.email,
        score: r.score,
        maxScore: 100,
        isOptical: r.isOptical || false,
        submittedAt: r.submittedAt || r.createdAt,
        answers: r.answers
      }))
    };

    // Set headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="optical_results_exam_${req.params.examId}_${Date.now()}.json"`);
    res.json(exportData);
  } catch (err) {
    console.error('Error exporting exam results:', err);
    res.status(500).json({ error: 'Export işlemi başarısız' });
  }
});

// Export all optical results for an instructor
app.get('/api/optical-results/export-all/:instructorId', async (req, res) => {
  try {
    // Get instructor's courses
    const courses = await Course.findAll({
      where: { instructorId: req.params.instructorId },
      attributes: ['id', 'title', 'code']
    });

    const courseIds = courses.map(c => c.id);

    if (courseIds.length === 0) {
      return res.json({
        exportDate: new Date().toISOString(),
        exportType: 'all_optical_results',
        courses: [],
        totalResults: 0
      });
    }

    // Get exams for these courses
    const exams = await Exam.findAll({
      where: { CourseId: { [require('sequelize').Op.in]: courseIds } },
      include: [{ model: Course, attributes: ['id', 'title', 'code'] }]
    });

    const examIds = exams.map(e => e.id);

    // Get all results
    const results = await ExamResult.findAll({
      where: {
        examId: { [require('sequelize').Op.in]: examIds },
        isOptical: true
      },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: Exam, as: 'exam', attributes: ['id', 'title', 'CourseId'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by course and exam
    const courseMap = {};
    courses.forEach(c => { courseMap[c.id] = { ...c.toJSON(), exams: [] }; });

    const examMap = {};
    exams.forEach(e => {
      examMap[e.id] = { id: e.id, title: e.title, courseId: e.CourseId, results: [] };
    });

    results.forEach(r => {
      if (examMap[r.examId]) {
        examMap[r.examId].results.push({
          studentId: r.student?.id,
          studentName: r.student?.name,
          score: r.score,
          submittedAt: r.submittedAt || r.createdAt
        });
      }
    });

    Object.values(examMap).forEach(exam => {
      if (courseMap[exam.courseId]) {
        courseMap[exam.courseId].exams.push(exam);
      }
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      exportType: 'all_optical_results',
      instructorId: parseInt(req.params.instructorId),
      summary: {
        totalCourses: courses.length,
        totalExams: exams.length,
        totalOpticalScans: results.length
      },
      courses: Object.values(courseMap)
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="all_optical_results_${Date.now()}.json"`);
    res.json(exportData);
  } catch (err) {
    console.error('Error exporting all results:', err);
    res.status(500).json({ error: 'Export işlemi başarısız' });
  }
});

// ==================== PROGRESS TRACKING API (Video/PDF İlerleme) ====================

// In-memory progress store (production'da db kullanılır)
const progressStore = new Map();

// Save content progress (video position, PDF page, etc.)
app.post('/api/progress', async (req, res) => {
  const { userId, contentType, contentId, position, duration, completed } = req.body;

  if (!userId || !contentType || !contentId) {
    return res.status(400).json({ error: 'userId, contentType, and contentId are required' });
  }

  try {
    const key = `${userId}_${contentType}_${contentId}`;
    const progress = {
      userId,
      contentType, // 'video' or 'pdf'
      contentId,
      position: position || 0,
      duration: duration || 0,
      completed: completed || false,
      percentage: duration > 0 ? Math.round((position / duration) * 100) : 0,
      updatedAt: new Date().toISOString()
    };

    progressStore.set(key, progress);
    console.log(`📊 Progress saved: ${contentType} ${contentId} - ${progress.percentage}%`);

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Error saving progress:', err);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Get content progress
app.get('/api/progress/:userId/:contentType/:contentId', async (req, res) => {
  const { userId, contentType, contentId } = req.params;

  try {
    const key = `${userId}_${contentType}_${contentId}`;
    const progress = progressStore.get(key);

    if (progress) {
      res.json(progress);
    } else {
      res.json({ position: 0, duration: 0, completed: false, percentage: 0 });
    }
  } catch (err) {
    console.error('Error fetching progress:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get all progress for a user
app.get('/api/progress/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userProgress = [];
    for (const [key, value] of progressStore) {
      if (key.startsWith(`${userId}_`)) {
        userProgress.push(value);
      }
    }
    res.json(userProgress);
  } catch (err) {
    console.error('Error fetching user progress:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ==================== ANTI-CHEAT API (Uygulama Değişiklik Algılama) ====================

// Log anti-cheat events
app.post('/api/anti-cheat/log', async (req, res) => {
  const { userId, examId, eventType, timestamp, metadata } = req.body;

  try {
    console.log(`🚨 Anti-Cheat: User ${userId}, Exam ${examId}, Event: ${eventType}`);

    // Log to proctoring table if exists
    if (examId) {
      await ProctoringLog.create({
        studentId: userId,
        examId,
        eventType: `anti_cheat_${eventType}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        metadata: { timestamp, ...metadata }
      });
    }

    res.json({ success: true, logged: true });
  } catch (err) {
    console.error('Anti-cheat log error:', err);
    res.json({ success: true }); // Fail silently
  }
});

// Get anti-cheat summary for an exam
app.get('/api/anti-cheat/summary/:examId', async (req, res) => {
  try {
    const logs = await ProctoringLog.findAll({
      where: {
        examId: req.params.examId,
        eventType: { [require('sequelize').Op.like]: 'anti_cheat_%' }
      },
      include: [{ model: User, as: 'student', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    // Group by student
    const summary = {};
    logs.forEach(log => {
      if (!summary[log.studentId]) {
        summary[log.studentId] = {
          student: log.student,
          events: [],
          totalViolations: 0
        };
      }
      summary[log.studentId].events.push({
        type: log.eventType.replace('anti_cheat_', ''),
        timestamp: log.createdAt
      });
      summary[log.studentId].totalViolations++;
    });

    res.json(Object.values(summary));
  } catch (err) {
    console.error('Error fetching anti-cheat summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Get all notes for a user
app.get('/api/notes', async (req, res) => {
  const { userId, category } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const whereClause = { UserId: userId };
    if (category) whereClause.category = category;

    const notes = await Note.findAll({
      where: whereClause,
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title', 'code'] },
        { model: Exam, as: 'exam', attributes: ['id', 'title'] }
      ],
      order: [['isPinned', 'DESC'], ['updatedAt', 'DESC']]
    });

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new note
app.post('/api/notes', async (req, res) => {
  const { userId, title, content, color, category, courseId, examId } = req.body;

  if (!userId || !title) {
    return res.status(400).json({ error: 'userId and title are required' });
  }

  try {
    const note = await Note.create({
      UserId: userId,
      title,
      content: content || '',
      color: color || '#FFE066',
      category: category || 'personal',
      CourseId: category === 'course' ? courseId : null,
      ExamId: category === 'exam' ? examId : null,
      isPinned: false
    });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update a note
app.put('/api/notes/:id', async (req, res) => {
  const { userId, title, content, color, category, courseId, examId } = req.body;

  try {
    const note = await Note.findOne({
      where: { id: req.params.id, UserId: userId }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }

    await note.update({
      title: title !== undefined ? title : note.title,
      content: content !== undefined ? content : note.content,
      color: color !== undefined ? color : note.color,
      category: category !== undefined ? category : note.category,
      CourseId: category === 'course' ? courseId : null,
      ExamId: category === 'exam' ? examId : null
    });

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle pin status
app.put('/api/notes/:id/pin', async (req, res) => {
  const { userId } = req.body;

  try {
    const note = await Note.findOne({
      where: { id: req.params.id, UserId: userId }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }

    await note.update({ isPinned: !note.isPinned });
    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  const { userId } = req.query;

  try {
    const note = await Note.findOne({
      where: { id: req.params.id, UserId: userId }
    });

    if (!note) {
      return res.status(404).json({ error: 'Note not found or access denied' });
    }

    await note.destroy();
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== SUPER ADMIN API ====================

// SEED DATA: 4 Test Questions (All Answer D) - User Request
app.get('/api/admin/seed-test-questions', async (req, res) => {
  try {
    const { examId } = req.query; // Allow targeted seeding
    let exam;

    if (examId) {
      exam = await Exam.findByPk(examId);
      if (!exam) return res.status(404).json({ error: 'Exam not found' });
    } else {
      // 1. Find or Create a Test Exam (Fallback)
      exam = await Exam.findOne({ where: { title: 'Test Exam - OMR' } });
      if (!exam) {
        // Find a course to attach to
        const course = await Course.findOne();
        if (!course) return res.status(400).json({ error: 'No course found to attach exam to.' });

        exam = await Exam.create({
          title: 'Test Exam - OMR',
          durationMinutes: 60,
          CourseId: course.id,
          isOpticalExam: true
        });
      }
    }

    // 2. Questions to Add (5 Diverse Questions - User Request)
    const newQuestions = [
      {
        text: 'Türkiye\'nin başkenti neresidir?',
        type: 'multiple_choice',
        points: 10,
        correctAnswer: 'C',
        options: { A: 'İstanbul', B: 'İzmir', C: 'Ankara (Doğru)', D: 'Antalya', E: 'Bursa' },
        ExamId: exam.id
      },
      {
        text: 'Hangi gezegen "Kızıl Gezegen" olarak bilinir?',
        type: 'multiple_choice',
        points: 10,
        correctAnswer: 'B',
        options: { A: 'Venüs', B: 'Mars (Doğru)', C: 'Jüpiter', D: 'Satürn', E: 'Neptün' },
        ExamId: exam.id
      },
      {
        text: 'Suyun kimyasal formülü nedir?',
        type: 'multiple_choice',
        points: 10,
        correctAnswer: 'A',
        options: { A: 'H2O (Doğru)', B: 'CO2', C: 'O2', D: 'NaCl', E: 'H2SO4' },
        ExamId: exam.id
      },
      {
        text: 'Fonksiyonel programlamada "side-effect" olmaması durumuna ne denir?',
        type: 'multiple_choice',
        points: 10,
        correctAnswer: 'E',
        options: { A: 'Recursion', B: 'Loop', C: 'Object', D: 'Class', E: 'Immutability / Pure (Doğru)' },
        ExamId: exam.id
      },
      {
        text: 'Bir byte kaç bit\'ten oluşur?',
        type: 'multiple_choice',
        points: 10,
        correctAnswer: 'D',
        options: { A: '4', B: '16', C: '32', D: '8 (Doğru)', E: '64' },
        ExamId: exam.id
      }
    ];

    // 3. Bulk Create
    await Question.bulkCreate(newQuestions);

    res.json({
      success: true,
      message: '5 Test Questions added successfully!',
      exam: exam.title,
      examId: exam.id,
      questionsAdded: 5
    });

  } catch (err) {
    console.error('Seed Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get system-wide statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalUsers, totalCourses, totalExams, totalNotes, totalResults, pendingRequests] = await Promise.all([
      User.count(),
      Course.count(),
      Exam.count(),
      Note.count(),
      ExamResult.count(),
      CourseAccessRequest.count({ where: { status: 'pending' } })
    ]);

    res.json({
      totalUsers,
      totalCourses,
      totalExams,
      totalNotes,
      totalResults,
      pendingRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get role distribution
app.get('/api/admin/roles', async (req, res) => {
  try {
    const roles = ['super_admin', 'manager', 'instructor', 'assistant', 'student', 'guest'];
    const distribution = [];

    for (const role of roles) {
      const count = await User.count({ where: { role } });
      distribution.push({ role, count });
    }

    res.json(distribution);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get exam statistics
app.get('/api/admin/exam-stats', async (req, res) => {
  try {
    const exams = await Exam.findAll();
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

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comprehensive admin dashboard data
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [stats, recentUsers, roles] = await Promise.all([
      // Stats
      Promise.all([
        User.count(),
        Course.count(),
        Exam.count(),
        Note.count(),
        CourseAccessRequest.count({ where: { status: 'pending' } })
      ]),
      // Recent users
      User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
      }),
      // Role distribution
      Promise.all([
        User.count({ where: { role: 'student' } }),
        User.count({ where: { role: 'instructor' } }),
        User.count({ where: { role: 'super_admin' } }),
        User.count({ where: { role: 'manager' } }),
        User.count({ where: { role: 'assistant' } })
      ])
    ]);

    res.json({
      stats: {
        totalUsers: stats[0],
        totalCourses: stats[1],
        totalExams: stats[2],
        totalNotes: stats[3],
        pendingRequests: stats[4]
      },
      recentUsers,
      roleDistribution: {
        students: roles[0],
        instructors: roles[1],
        admins: roles[2],
        managers: roles[3],
        assistants: roles[4]
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUNUCU BAŞLAT ---
app.listen(3001, '0.0.0.0', async () => {
  console.log('🚀 Server 3001 portunda çalışıyor (tüm ağlardan erişilebilir)...');
  try {
    await sequelize.sync({ alter: true }); // alter:true - yeni tablolar için
    console.log('✅ Veritabanı Hazır (sync with alter).');

    // Eğer hiç kullanıcı yoksa test verisi ekle (sadece ilk seferde)
    const count = await User.count();
    if (count === 0) {
      await User.create({ name: 'Süper Admin', email: 'admin@uni.edu.tr', password: '123', role: 'super_admin' });
      const hoca = await User.create({ name: 'Dr. Engin', email: 'hoca@uni.edu.tr', password: '123', role: 'instructor' });
      await User.create({ name: 'Ali Yılmaz', email: 'ali@uni.edu.tr', password: '123', role: 'student' });
      const course = await Course.create({ title: 'CS305: Veritabanı', code: 'CS305', description: 'SQL', instructorId: hoca.id });
      const exam = await Exam.create({ title: 'Vize (Optik)', durationMinutes: 45, isOpticalExam: true, CourseId: course.id });

      // Online Sınav ve Sorular
      const quiz = await Exam.create({ title: 'Final (Online)', durationMinutes: 60, isOpticalExam: false, CourseId: course.id });
      await Question.create({
        ExamId: quiz.id,
        text: 'SQL nedir?',
        points: 20,
        type: 'multiple_choice',
        options: JSON.stringify({ A: 'Structured Query Language', B: 'Simple Query List', C: 'Standard Question Library' }),
        correctAnswer: 'A'
      });
      await Question.create({
        ExamId: quiz.id,
        text: 'Hangisi bir DML komutudur?',
        points: 20,
        type: 'multiple_choice',
        options: JSON.stringify({ A: 'CREATE', B: 'SELECT', C: 'GRANT' }),
        correctAnswer: 'B'
      });
      await Question.create({
        ExamId: quiz.id,
        text: 'Primary Key null olabilir mi?',
        points: 20,
        type: 'true_false',
        options: JSON.stringify({ A: 'Evet', B: 'Hayır' }),
        correctAnswer: 'B'
      });

      console.log('✅ Test Verileri Eklendi.');
    }
  } catch (err) { console.error('DB Hatası:', err); }
});