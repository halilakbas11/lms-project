# Google Cloud - Sıfırdan Deploy Rehberi

Bu rehber, Google Cloud hesabı olmayan birinin LMS projesini internete açmasını adım adım anlatır.

---

## ADIM 1: Google Cloud Hesabı Oluşturma

1. **https://cloud.google.com** adresine gidin
2. **"Ücretsiz Başlayın"** butonuna tıklayın
3. Google hesabınızla giriş yapın (yoksa oluşturun)
4. **Aşağıdaki bilgileri girin:**
   - Ülke: Türkiye
   - Kuruluş türü: Bireysel
   - Kullanım amacı: Kişisel projeler
5. **Ödeme bilgilerini girin** (Kredi kartı gerekli ama 300$ ücretsiz kredi alacaksınız!)
   - İlk 90 gün 300$ kredi
   - Kredi bitmeden ücret kesilmez

> ⚠️ **NOT:** Kredi kartı bilgisi zorunlu ama deneme süresi boyunca ücret kesilmez.

---

## ADIM 2: Yeni Proje Oluşturma

1. Cloud Console açıldığında sol üstte **"Proje Seç"** yazısına tıklayın
2. **"Yeni Proje"** butonuna tıklayın
3. Proje adı: `lms-project`
4. **"Oluştur"** tıklayın
5. Proje oluşturulunca otomatik seçilecek

---

## ADIM 3: Cloud Run API'sini Etkinleştirme

1. Sol menüden **"API'ler ve Hizmetler" > "API'leri Etkinleştir"** tıklayın
2. Arama kutusuna **"Cloud Run"** yazın
3. **"Cloud Run Admin API"** tıklayın
4. **"Etkinleştir"** butonuna tıklayın
5. Aynı şekilde **"Cloud Build API"** yi de etkinleştirin

---

## ADIM 4: Google Cloud CLI Kurulumu (Bilgisayarınıza)

### Windows için:

1. https://cloud.google.com/sdk/docs/install adresine gidin
2. **"Windows 64-bit"** indirin
3. İndirilen .exe dosyasını çalıştırın
4. Kurulum sihirbazını takip edin (Next, Next, Install)
5. Kurulum bitince **"Run gcloud init"** seçili olsun
6. **Finish** tıklayın

### Terminalden Kurulum Kontrolü:
PowerShell açın ve yazın:
```
gcloud --version
```

---

## ADIM 5: gcloud ile Giriş Yapma

PowerShell'de şu komutları sırayla çalıştırın:

```powershell
# 1. Google hesabınızla giriş yapın (tarayıcı açılacak)
gcloud auth login

# 2. Projenizi seçin
gcloud config set project lms-project

# 3. Bölge ayarlayın (Avrupa - düşük gecikme)
gcloud config set run/region europe-west1
```

---

## ADIM 6: Backend'i Deploy Etme

```powershell
# Backend klasörüne gidin
cd C:\Users\halil\OneDrive\Desktop\lms-project\backend

# Cloud Run'a deploy edin (BU KOMUT HER ŞEYİ YAPAR!)
gcloud run deploy lms-backend --source . --allow-unauthenticated --port 3001
```

**Bu komut:**
- Dockerfile'ı okur
- Docker image oluşturur
- Google Cloud'a yükler
- URL verir

**Çıktı örneği:**
```
Service URL: https://lms-backend-abc123-ew.a.run.app
```

Bu URL'yi kaydedin! ✅

---

## ADIM 7: API URL'ini Güncelleme

Backend URL'inizi aldıktan sonra:

### Mobile için (.env dosyası oluşturun):
`mobile/.env` dosyası oluşturun:
```
EXPO_PUBLIC_API_URL=https://lms-backend-abc123-ew.a.run.app
```

### Frontend için (.env.local dosyası oluşturun):
`frontend/.env.local` dosyası oluşturun:
```
NEXT_PUBLIC_API_URL=https://lms-backend-abc123-ew.a.run.app
```

---

## ADIM 8: Frontend'i Vercel'e Deploy Etme (ÜCRETSİZ)

1. https://vercel.com adresine gidin
2. **"Sign Up"** → **"Continue with GitHub"** (veya Google)
3. **"New Project"** tıklayın
4. GitHub'ınızı bağlayın ve projenizi seçin
5. **Root Directory**: `frontend` yazın
6. **Environment Variables** ekleyin:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://lms-backend-abc123-ew.a.run.app`
7. **"Deploy"** tıklayın

Vercel size bir URL verecek: `https://lms-project.vercel.app`

---

## ÖZET

| Servis | URL |
|--------|-----|
| Backend | `https://lms-backend-xxx.run.app` |
| Frontend | `https://lms-project.vercel.app` |
| Mobil API | Aynı backend URL |

---

## Maliyet

- **İlk 90 gün**: 300$ ücretsiz kredi
- **Cloud Run**: Ayda 2 milyon istek ücretsiz
- **Vercel**: Hobby plan tamamen ücretsiz

**Tahmini maliyet: 0$ (küçük projeler için)**
