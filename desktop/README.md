# LMS Desktop

Electron masaüstü uygulaması - Windows ve macOS için kapsamlı LMS platformu.

## Özellikler

- ✅ Windows 10/11 desteği (x64, ARM64)
- ✅ macOS 11+ desteği (Intel, Apple Silicon)
- ✅ Otomatik güncelleme
- ✅ Sistem tepsisi entegrasyonu
- ✅ Yerel dosya sistemi erişimi
- ✅ Çevrimdışı mod
- ✅ Webcam/mikrofon desteği (proctoring için)

## Kurulum

```bash
cd desktop
npm install
```

## Geliştirme

Önce web frontend'i başlatın:

```bash
cd ../frontend
npm run dev
```

Sonra desktop uygulamasını çalıştırın:

```bash
cd ../desktop
npm run dev
```

## Build

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Tüm Platformlar
```bash
npm run build:all
```

Build çıktıları `release/` klasöründe oluşturulur.

## Yapı

```
desktop/
├── src/
│   ├── main.ts      # Ana process
│   └── preload.ts   # IPC köprüsü
├── assets/
│   ├── icon.ico     # Windows ikonu
│   └── icon.icns    # macOS ikonu
├── package.json
└── tsconfig.json
```

## API

Renderer process'ten kullanılabilir API'ler:

```typescript
// Uygulama bilgisi
const info = await window.electronAPI.getAppInfo();

// Dosya indirme
await window.electronAPI.downloadFile(url, 'dosya.pdf');

// Güncelleme kontrolü
await window.electronAPI.checkForUpdates();

// Bildirim göster
await window.electronAPI.showNotification('Başlık', 'Mesaj');
```
