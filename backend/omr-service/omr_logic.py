import cv2
import numpy as np
import base64

def base64_to_image(base64_string):
    """Base64 string'i OpenCV görseline çevirir"""
    try:
        # Header'ı temizle (data:image/jpeg;base64, vb.)
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        img_data = base64.b64decode(base64_string)
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception as e:
        print(f"Resim çözme hatası: {e}")
        return None

def order_points(pts):
    """Dörtgenin köşe noktalarını sıralar: sol-üst, sağ-üst, sağ-alt, sol-alt"""
    rect = np.zeros((4, 2), dtype="float32")
    
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)] # Sol-üst (en küçük toplam)
    rect[2] = pts[np.argmax(s)] # Sağ-alt (en büyük toplam)
    
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)] # Sağ-üst (en küçük fark)
    rect[3] = pts[np.argmax(diff)] # Sol-alt (en büyük fark)
    
    return rect

def four_point_transform(image, pts):
    """Perspektif düzeltme uygular (kuş bakışı görünüm)"""
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    
    # Genişliği hesapla (maksimum olanı al)
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))
    
    # Yüksekliği hesapla
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    
    # Hedef noktalar
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")
        
    # Dönüşüm matrisini hesapla ve uygula
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    
    return warped

def process_omr(base64_image, question_count=10):
    """
    Optik formu işler ve cevapları döndürür.
    Perspektif düzeltme yapamazsa, adaptive threshold ile direkt okumayı dener.
    """
    image = base64_to_image(base64_image)
    if image is None:
        return {"success": False, "error": "Geçersiz resim formatı"}

    try:
        # Orijinal kopyası (Debug çizimleri için)
        debug_img = image.copy()
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edged = cv2.Canny(blurred, 75, 200)

        # Konturları bul
        cnts = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cnts = cnts[0] if len(cnts) == 2 else cnts[1]
        
        docCnt = None

        # En büyük konturları sırala
        if len(cnts) > 0:
            cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
            
            # Kağıdı (4 köşeli şekli) bulmaya çalış
            for c in cnts:
                peri = cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, 0.02 * peri, True)
                
                if len(approx) == 4:
                    docCnt = approx
                    break

        # Kağıt bulunduysa perspektif düzelt, bulunamadıysa orijinali kullan
        if docCnt is not None:
            warped = four_point_transform(gray, docCnt.reshape(4, 2))
            warped_color = four_point_transform(image, docCnt.reshape(4, 2))
            print("✅ Kağıt algılandı ve düzeltildi.")
        else:
            print("⚠️ Kağıt sınırları net bulunamadı, tam resim taranacak.")
            warped = gray
            warped_color = image

        # Adaptive Threshold (Otsu) - Kağıdı siyah/beyaz yap
        thresh = cv2.threshold(warped, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        
        # Grid Parametreleri (Mobil overlay ile uyumlu)
        # Left 33%, Top 25%, Width 30%, Height 67.5%
        h, w = thresh.shape
        start_x = int(w * 0.333)
        start_y = int(h * 0.25)
        grid_width = int(w * 0.30)
        grid_height = int(h * 0.675)
        
        gap_x = grid_width // 4
        gap_y = grid_height // (question_count - 1 if question_count > 1 else 1)
        # Kabarcık (bubble) tarama boyutu
        scan_r = int(min(gap_x, gap_y) * 0.20) # Yarıçap
        
        answers = {}
        confidences = {}
        detected_count = 0
        options = ['A', 'B', 'C', 'D', 'E']
        
        for q in range(question_count):
            row_bubbles = []
            
            for i, opt in enumerate(options):
                cx = start_x + (i * gap_x)
                cy = start_y + (q * gap_y)
                
                # Sınır dışına çıkma kontrolü
                if cx < scan_r or cy < scan_r or cx >= w - scan_r or cy >= h - scan_r:
                    continue
                
                # Maske oluştur (Daire şeklinde tarama)
                mask = np.zeros(thresh.shape, dtype="uint8")
                cv2.circle(mask, (cx, cy), scan_r, 255, -1)
                
                # Maskelenmiş alandaki beyaz piksel sayısını (dolu olunca siyah olur, ama biz thresh inverse yaptık o yüzden beyaz sayıyoruz)
                # THRESH_BINARY_INV: Arkaplan siyah(0), Dolu alanlar beyaz(255)
                # Kabarcıklar kağıtta koyu(kalem) olduğu için inv modunda beyaz görünür.
                mask_pixels = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
                total_pixels = cv2.countNonZero(mask)
                fill_ratio = mask_pixels / total_pixels if total_pixels > 0 else 0
                
                row_bubbles.append((opt, fill_ratio, cx, cy))
                
                # Debug: Taranan alanı işaretle (Mavi)
                cv2.circle(warped_color, (cx, cy), scan_r, (255, 0, 0), 1)

            # En dolu olanı bul
            row_bubbles.sort(key=lambda x: x[1], reverse=True)
            best = row_bubbles[0]
            second = row_bubbles[1] if len(row_bubbles) > 1 else (None, 0, 0, 0)
            
            # Eşik Değerleri
            MIN_FILL = 0.20 # En az %20 dolu olmalı
            DIFF_MARGIN = 0.10 # İkinci ile arasında %10 fark olmalı
            
            detected_opt = None
            confidence = 0
            
            if best[1] > MIN_FILL and (best[1] - second[1]) > DIFF_MARGIN:
                detected_opt = best[0]
                confidence = int((best[1] - second[1]) * 200) # Yapay güven skoru
                confidence = min(100, confidence)
                
                # Debug: Seçileni Yeşil işaretle
                cv2.circle(warped_color, (best[2], best[3]), scan_r, (0, 255, 0), 2)
            else:
                # Debug: Seçilmeyeni Kırmızı işaretle
                cv2.circle(warped_color, (best[2], best[3]), scan_r, (0, 0, 255), 2)
            
            if detected_opt:
                answers[str(q + 1)] = detected_opt
                detected_count += 1
            else:
                answers[str(q + 1)] = None

        # İşlenmiş resmi base64'e çevir
        retval, buffer = cv2.imencode('.jpg', warped_color)
        debug_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "success": True,
            "answers": answers,
            "detected_count": detected_count,
            "debug_image": f"data:image/jpeg;base64,{debug_base64}",
            "processed_method": "perspective_corrected" if docCnt is not None else "direct_scan"
        }
        
    except Exception as e:
        import traceback
        return {"success": False, "error": str(e), "trace": traceback.format_exc()}
