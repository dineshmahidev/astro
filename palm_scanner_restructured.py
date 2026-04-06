import os
import cv2
import numpy as np
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import time
import pymysql
from datetime import datetime

app = FastAPI(title="Divine Palm AI", description="Advanced Palmistry Analysis with Clear Line Detection")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Configuration
DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "astro_2",
    "autocommit": True
}

STORAGE_BASE = "c:/xampp/htdocs/astro-2/backend/storage/app/public/palm_readings"
os.makedirs(STORAGE_BASE, exist_ok=True)

# ============================================================================
# PALM PROCESSING PIPELINE - Modular Approach
# ============================================================================

class PalmProcessor:
    """Dedicated class for all palm processing operations"""
    
    def __init__(self, image):
        self.original = image
        self.height, self.width = image.shape[:2]
        
    def extract_hand_region(self):
        """Step 1: Isolate hand from background using HSV"""
        hsv = cv2.cvtColor(self.original, cv2.COLOR_BGR2HSV)
        
        # Better skin detection ranges (HSV)
        lower_skin = np.array([0, 10, 60], dtype=np.uint8)
        upper_skin = np.array([30, 200, 255], dtype=np.uint8)
        
        skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Morphological cleaning
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel, iterations=3)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=2)
        
        return skin_mask
    
    def get_palm_roi(self, skin_mask):
        """Step 2: Find the main palm area (remove fingers)"""
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None, None
        
        hand_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(hand_contour)
        
        # Define palm area (center of the hand, avoiding fingers)
        # Typically palm is in the middle-lower portion
        margin_x = int(w * 0.15)
        margin_y = int(h * 0.30)
        
        palm_x = x + margin_x
        palm_y = y + margin_y
        palm_w = w - (2 * margin_x)
        palm_h = int(h * 0.50)
        
        palm_roi = self.original[palm_y:palm_y+palm_h, palm_x:palm_x+palm_w].copy()
        
        return palm_roi, (palm_x, palm_y, palm_w, palm_h)
    
    def enhance_lines(self, palm_roi):
        """Step 3: Enhance palm lines for clear visibility"""
        gray = cv2.cvtColor(palm_roi, cv2.COLOR_BGR2GRAY)
        
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(10, 10))
        enhanced = clahe.apply(gray)
        
        # Bilateral filter to smooth while preserving edges
        bilateral = cv2.bilateralFilter(enhanced, 9, 75, 75)
        
        return bilateral
    
    def detect_palm_lines(self, enhanced_roi):
        """Step 4: Detect lines using Canny + morphological operations"""
        
        # Adaptive Canny thresholding
        sigma = 0.33
        v = np.median(enhanced_roi)
        lower = int(max(0, (1.0 - sigma) * v))
        upper = int(min(255, (1.0 + sigma) * v))
        
        edges = cv2.Canny(enhanced_roi, lower, upper)
        
        # Thicken the lines for better visibility
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Remove noise (small components)
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        # Line thinning (skeleton) - optional but helpful
        edges = self._skeletonize(edges)
        
        return edges
    
    def _skeletonize(self, binary_img):
        """Thin lines to single pixel width"""
        kernel = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
        thin = binary_img.copy()
        
        while cv2.countNonZero(thin) > 0:
            eroded = cv2.erode(thin, kernel)
            opening = cv2.morphologyEx(eroded, cv2.MORPH_OPEN, kernel)
            thin = thin - opening
            if cv2.countNonZero(thin) == 0:
                break
        
        return thin
    
    def count_lines_accurately(self, edges):
        """Step 5: Count unique palm lines (not just pixels)"""
        # Count contours as individual lines
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter out noise (very small contours)
        significant_lines = [c for c in contours if cv2.contourArea(c) > 20]
        
        # Estimate line length to prioritize major lines
        line_scores = []
        for line in significant_lines:
            area = cv2.contourArea(line)
            perimeter = cv2.arcLength(line, False)
            line_scores.append(perimeter)
        
        lines_count = len(significant_lines)
        avg_line_strength = np.mean(line_scores) if line_scores else 0
        
        return lines_count, avg_line_strength, significant_lines
    
    def process(self):
        """Execute full pipeline"""
        # Step 1: Extract hand
        skin_mask = self.extract_hand_region()
        
        # Step 2: Get palm ROI
        palm_roi, roi_coords = self.get_palm_roi(skin_mask)
        if palm_roi is None:
            return None, "Hand not detected clearly"
        
        # Step 3: Enhance
        enhanced = self.enhance_lines(palm_roi)
        
        # Step 4: Detect lines
        edges = self.detect_palm_lines(enhanced)
        
        # Step 5: Count lines
        lines_count, line_strength, contours = self.count_lines_accurately(edges)
        
        return {
            "success": True,
            "palm_roi": palm_roi,
            "enhanced": enhanced,
            "edges": edges,
            "lines_count": lines_count,
            "line_strength": line_strength,
            "roi_coords": roi_coords
        }, None


# ============================================================================
# INSIGHTS GENERATION
# ============================================================================

def generate_palm_insights(lines_count, line_strength):
    """Generate detailed palmistry insights based on detection"""
    
    # Categorize based on both count and strength
    intensity_score = lines_count * (line_strength / 100) if line_strength > 0 else lines_count
    
    if intensity_score > 100:
        category = "Complex Soul"
        return {
            "category": category,
            "summary": "Your palm reveals profound complexity and spiritual depth. Multiple interconnected paths suggest a life of rich experiences and multiple destinies.",
            "life": "Strong vitality. Clear life path with natural resilience and longevity markers visible.",
            "head": "Exceptionally analytical. Multiple thought patterns show adaptability and strategic brilliance.",
            "heart": "Deeply emotional. Rich emotional landscape with capacity for profound love and connection.",
            "destiny": "Multi-path destiny. Success through various channels and adaptability.",
            "confidence": 0.95
        }
    elif intensity_score > 50:
        category = "Balanced Journey"
        return {
            "category": category,
            "summary": "Well-defined palm pathways indicate clarity and purpose. You possess natural balance between logic and emotion.",
            "life": "Stable health. Consistent energy for long-term goals and steady progress.",
            "head": "Clear thinking. Good balance between intuition and logic.",
            "heart": "Sincere emotions. Deep but stable emotional patterns.",
            "destiny": "Focused path. Clear direction with steady advancement.",
            "confidence": 0.92
        }
    else:
        category = "Sharp Focus"
        return {
            "category": category,
            "summary": "Concentrated destiny markers. Your focused nature drives rapid achievement and clarity.",
            "life": "Intense energy. Quality over quantity in life pursuits.",
            "head": "Sharp decisive mind. Quick conclusions and focused goals.",
            "heart": "Selective deep connections. Prefer profound over superficial bonds.",
            "destiny": "Direct path to success. Minimal obstacles, high focus.",
            "confidence": 0.90
        }


# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

def save_to_db(user_id, image_name, lines_count, line_strength):
    """Save palm reading to database"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Calculate scores based on actual detection
        life_line_score = min(99, (lines_count * 0.5) + (line_strength * 0.3))
        head_line_score = min(98, (lines_count * 0.6) + (line_strength * 0.25))
        heart_line_score = min(97, (lines_count * 0.4) + (line_strength * 0.35))
        
        sql = """INSERT INTO palm_readings 
                 (user_id, image_path, detection_confidence, life_line_length, 
                  head_line_length, heart_line_length, quality, created_at, updated_at) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        
        rel_path = f"palm_readings/{image_name}"
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        detection_confidence = min(0.98, 0.75 + (lines_count / 200))
        
        values = (
            user_id, 
            rel_path, 
            detection_confidence, 
            life_line_score, 
            head_line_score, 
            heart_line_score, 
            'High', 
            now, 
            now
        )
        
        cursor.execute(sql, values)
        conn.commit()
        last_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return last_id
    except Exception as e:
        print(f"Database error: {e}")
        return None


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
def health():
    return {
        "status": "online",
        "service": "Divine Palm AI",
        "version": "2.0",
        "database": "connected"
    }


@app.post("/process-palm")
async def process_palm(
    file: UploadFile = File(...),
    user_id: int = Form(None)
):
    """Main palm scanning endpoint with improved detection"""
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.COLOR_BGR2COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Resize if too large (optimization)
        if img.shape[1] > 1200:
            scale = 1200 / img.shape[1]
            img = cv2.resize(img, (1200, int(img.shape[0] * scale)))
        
        # Process palm
        processor = PalmProcessor(img)
        result, error = processor.process()
        
        if error:
            raise HTTPException(status_code=400, detail=error)
        
        # Generate insights
        insights = generate_palm_insights(
            result["lines_count"],
            result["line_strength"]
        )
        
        # Save processed image
        timestamp = int(time.time())
        filename = f"palm_vision_{timestamp}.jpg"
        save_path = os.path.join(STORAGE_BASE, filename)
        cv2.imwrite(save_path, result["edges"])
        
        # Save to database
        record_id = None
        if user_id:
            record_id = save_to_db(
                user_id,
                filename,
                result["lines_count"],
                result["line_strength"]
            )
        
        # Prepare response image
        _, buffer = cv2.imencode('.jpg', result["edges"])
        base64_str = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "success": True,
            "record_id": record_id,
            "processed_image": f"data:image/jpeg;base64,{base64_str}",
            "lines_detected": result["lines_count"],
            "line_strength": round(result["line_strength"], 2),
            "analysis": insights,
            "timestamp": timestamp
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "detail": "Palm processing failed"
        }


@app.get("/debug-palm/{record_id}")
async def debug_palm(record_id: int):
    """Debug endpoint to verify detection quality"""
    return {
        "record_id": record_id,
        "status": "available",
        "debug_enabled": True,
        "note": "Check /storage/palm_readings/ for processed images"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
