import cv2
import numpy as np
import base64

def base64_to_image(base64_string):
    """Base64 string'i OpenCV görseline çevirir"""
    try:
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
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect

def four_point_transform(image, pts):
    rect = order_points(pts)
    (tl, tr, br, bl) = rect
    widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
    widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
    maxWidth = max(int(widthA), int(widthB))
    heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
    heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
    maxHeight = max(int(heightA), int(heightB))
    dst = np.array([
        [0, 0],
        [maxWidth - 1, 0],
        [maxWidth - 1, maxHeight - 1],
        [0, maxHeight - 1]], dtype="float32")
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
    return warped


def process_omr(base64_image, question_count=10):
    """
    Optik formu işler (4 Sütunlu Yapı İçin).
    """
    try:
        image = base64_to_image(base64_image)
        if image is None:
            return {"success": False, "error": "Geçersiz resim formatı (Base64 decode hatası)"}

        # 1. Görüntüyü Hazırla
        debug_img = image.copy()
        
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        except Exception as cv_err:
             return {"success": False, "error": f"OpenCV Pre-process Error: {str(cv_err)}"}
        
        h, w = thresh.shape
        
        # Cevap Alanı Tanımı (Formun alt %60'ı)
        # 4 Sütun var. Her sütun ~%25 genişlikte.
        
        HEADER_HEIGHT_RATIO = 0.40 
        MARGIN_X = 0.05 
        
        answer_area_y = int(h * HEADER_HEIGHT_RATIO)
        answer_area_h = h - answer_area_y - int(h * 0.05)
        column_width = (w * (1 - 2 * MARGIN_X)) / 4
        
        answers = {}
        detected_count = 0
        options = ['A', 'B', 'C', 'D', 'E']
        
        ROWS_PER_COL = 10
        total_questions = min(question_count, 40)
        
        # Güvenlik Kontrolü: Boyutlar çok küçükse hata ver
        if w < 100 or h < 100:
             return {"success": False, "error": "Resim çözünürlüğü çok düşük."}

        for col_idx in range(4):
            col_start_x = int((w * MARGIN_X) + (col_idx * column_width))
            start_q = (col_idx * ROWS_PER_COL) + 1
            
            if start_q > total_questions:
                break
                
            row_height = answer_area_h / ROWS_PER_COL
            bubble_gap_x = (column_width * 0.8) / 4 
            bubble_start_x_offset = column_width * 0.1
            
            scan_r = int(min(bubble_gap_x, row_height) * 0.25)
            # Yarıçap çok küçükse varsayılan değer ata
            if scan_r < 3: scan_r = 3
            
            for r in range(ROWS_PER_COL):
                q_num = start_q + r
                if q_num > total_questions:
                    break
                    
                row_bubbles = []
                cy = int(answer_area_y + (r * row_height) + (row_height / 2))
                
                for i, opt in enumerate(options):
                    cx = int(col_start_x + bubble_start_x_offset + (i * bubble_gap_x))
                    
                    if cx < scan_r or cy < scan_r or cx >= w - scan_r or cy >= h - scan_r:
                        continue
                        
                    mask = np.zeros(thresh.shape, dtype="uint8")
                    cv2.circle(mask, (cx, cy), scan_r, 255, -1)
                    
                    mask_pixels = cv2.countNonZero(cv2.bitwise_and(thresh, thresh, mask=mask))
                    total_pixels = cv2.countNonZero(mask)
                    fill_ratio = mask_pixels / total_pixels if total_pixels > 0 else 0
                    
                    row_bubbles.append((opt, fill_ratio, cx, cy))
                    cv2.circle(debug_img, (cx, cy), scan_r, (255, 0, 0), 1)

                if not row_bubbles:
                    answers[str(q_num)] = None
                    continue

                row_bubbles.sort(key=lambda x: x[1], reverse=True)
                best = row_bubbles[0]
                second = row_bubbles[1] if len(row_bubbles) > 1 else (None, 0, 0, 0)
                
                detected_opt = None
                
                # Basit eşik değeri
                if best[1] > 0.35: # Min %35 doluluk
                    if len(row_bubbles) < 2 or (best[1] - second[1] > 0.10):
                         detected_opt = best[0]
                         cv2.circle(debug_img, (best[2], best[3]), scan_r, (0, 255, 0), 3)

                answers[str(q_num)] = detected_opt
                if detected_opt:
                    detected_count += 1

        try:
            retval, buffer = cv2.imencode('.jpg', debug_img)
            debug_base64 = base64.b64encode(buffer).decode('utf-8')
        except:
            debug_base64 = "" # Debug resmi oluşturulamazsa boş ver
        
        return {
            "success": True,
            "answers": answers,
            "detected_count": detected_count,
            "debug_image": f"data:image/jpeg;base64,{debug_base64}",
            "processed_method": "MultiColumn_v2_Robust"
        }

    except Exception as e:
        import traceback
        return {"success": False, "error": str(e), "trace": traceback.format_exc()}

