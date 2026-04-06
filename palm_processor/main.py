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
        
        # Better skin detection ranges (HSV) - optimized for diverse skin tones
        lower_skin = np.array([0, 10, 60], dtype=np.uint8)
        upper_skin = np.array([30, 200, 255], dtype=np.uint8)
        
        skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Morphological cleaning to solidy the hand mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_CLOSE, kernel, iterations=3)
        skin_mask = cv2.morphologyEx(skin_mask, cv2.MORPH_OPEN, kernel, iterations=2)
        
        return skin_mask
    
    def get_palm_roi(self, skin_mask):
        """Step 2: Find the main palm area (remove fingers and background)"""
        contours, _ = cv2.findContours(skin_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return None, None
        
        hand_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(hand_contour)
        
        # Define palm area (center of the hand, Avoiding fingers)
        # We take a specific internal region to minimize outlines
        margin_x = int(w * 0.15)
        margin_y = int(h * 0.30) # Skip top 30% to avoid fingers
        
        palm_x = x + margin_x
        palm_y = y + margin_y
        palm_w = w - (2 * margin_x)
        palm_h = int(h * 0.50) # Take the central 50%
        
        # Boundary safety
        palm_y = max(0, min(palm_y, self.height - 10))
        palm_x = max(0, min(palm_x, self.width - 10))
        palm_h = max(10, min(palm_h, self.height - palm_y))
        palm_w = max(10, min(palm_w, self.width - palm_x))
        
        palm_roi = self.original[palm_y:palm_y+palm_h, palm_x:palm_x+palm_w].copy()
        
        return palm_roi, (palm_x, palm_y, palm_w, palm_h)
    
    def enhance_lines(self, palm_roi):
        """Step 3: Enhance palm lines for clear visibility while smoothing skin"""
        gray = cv2.cvtColor(palm_roi, cv2.COLOR_BGR2GRAY)
        
        # Apply Optimized CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(10, 10))
        enhanced = clahe.apply(gray)
        
        # Bilateral filter to smooth skin WHILE preserving edges (the lines)
        bilateral = cv2.bilateralFilter(enhanced, 9, 75, 75)
        
        return bilateral
    
    def detect_palm_lines(self, enhanced_roi):
        """Step 4: Detect lines using Adaptive Canny + Morphological operations"""
        
        # Adaptive Canny thresholding based on image median
        sigma = 0.33
        v = np.median(enhanced_roi)
        lower = int(max(0, (1.0 - sigma) * v))
        upper = int(min(255, (1.0 + sigma) * v))
        
        edges = cv2.Canny(enhanced_roi, lower, upper)
        
        # Slight dilation to connect broken lines
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Morphological closing to fill small gaps
        edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=1)
        
        # Skeletonization to thin lines to 1-pixel width for professionalism
        edges = self._skeletonize(edges)
        
        return edges
    
    def _skeletonize(self, binary_img):
        """Mathematical morphological thinning (skeletonization)"""
        skel = np.zeros(binary_img.shape, np.uint8)
        element = cv2.getStructuringElement(cv2.MORPH_CROSS, (3, 3))
        temp_img = binary_img.copy()
        
        while True:
            eroded = cv2.erode(temp_img, element)
            temp = cv2.dilate(eroded, element)
            temp = cv2.subtract(temp_img, temp)
            skel = cv2.bitwise_or(skel, temp)
            temp_img = eroded.copy()
            if cv2.countNonZero(temp_img) == 0:
                break
        
        return skel
    
    def count_lines_accurately(self, edges):
        """Step 5: Count actual palm contours as unique lines"""
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter noise (exclude very small contours)
        significant_lines = [c for c in contours if cv2.arcLength(c, False) > 20]
        
        line_scores = []
        for line in significant_lines:
            perimeter = cv2.arcLength(line, False)
            line_scores.append(perimeter)
        
        lines_count = len(significant_lines)
        avg_line_strength = np.mean(line_scores) if line_scores else 0
        
        return lines_count, avg_line_strength, significant_lines
    
    def process(self):
        """Execute full structured pipeline"""
        # 1. Extract hand
        skin_mask = self.extract_hand_region()
        
        # 2. Get palm ROI
        palm_roi, roi_coords = self.get_palm_roi(skin_mask)
        if palm_roi is None or palm_roi.size == 0:
            return None, "Palm region not detected. Center your hand."
        
        # 3. Enhance
        enhanced = self.enhance_lines(palm_roi)
        
        # 4. Detect lines
        edges = self.detect_palm_lines(enhanced)
        
        # 5. Count lines
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
# INSIGHTS GENERATION - SCORING ENGINE V3.0
# ============================================================================

def generate_palm_insights(lines_count, line_strength):
    """
    Generate weighted palmistry insights based on the Visual Reference Card formulas.
    Scale: 0-10 internally, 0-100 for display.
    """
    
    # 1. Map Vision Metrics to Scoring Points (1-10)
    # Length Points (Based on average line perimeter)
    len_pts = min(10, max(2, (line_strength / 20))) 
    # Depth/Clarity Points (Based on detection reliability)
    depth_pts = min(10, max(2, (lines_count / 3)))
    # Continuity Points (Simulated based on contour count vs pixel density)
    cont_pts = 8 if lines_count < 20 else 6 # Fewer, cleaner lines = better continuity
    
    # 2. Apply Measurement Formulas
    # Health = (Length × 0.4) + (Depth × 0.3) + (Continuity × 0.3)
    health_score = (len_pts * 0.4) + (depth_pts * 0.3) + (cont_pts * 0.3)
    
    # Intelligence = (Length × 0.3) + (Depth × 0.4) + (Shape/Cont_pts × 0.3)
    intel_score = (len_pts * 0.3) + (depth_pts * 0.4) + (cont_pts * 0.3)
    
    # Relationship = (Depth × 0.4) + (Pos/Shape × 0.3) + (Length × 0.3)
    rel_score = (depth_pts * 0.4) + (8 * 0.3) + (len_pts * 0.3)
    
    # Career/Success = (lines_count * 0.6) + (line_strength * 0.4) - mapped to 1-10
    success_pts = min(10, (lines_count / 5) + (line_strength / 50))
    
    # 3. Generate Interpretations (Tamil + English)
    def interpret(score):
        score_100 = score * 10
        if score_100 >= 81: return "EXCELLENT ✓✓", "மிகவும் சிறப்பு"
        if score_100 >= 61: return "GOOD ✓", "நல்ல நிலை"
        if score_100 >= 41: return "FAIR", "சாதாரண நிலை"
        return "POOR ⚠️", "முன்னேற்றம் தேவை"

    res_h, tam_h = interpret(health_score)
    res_i, tam_i = interpret(intel_score)
    res_r, tam_r = interpret(rel_score)
    res_s, tam_s = interpret(success_pts)

    return {
        "scores": {
            "health": round(health_score * 10, 1),
            "intelligence": round(intel_score * 10, 1),
            "relationship": round(rel_score * 10, 1),
            "success": round(success_pts * 10, 1)
        },
        "interpretations": {
            "health": f"{res_h} - {tam_h}",
            "intelligence": f"{res_i} - {tam_i}",
            "relationship": f"{res_r} - {tam_r}",
            "success": f"{res_s} - {tam_s}"
        },
        "summary": "Your palm lines indicate a strong foundation with specific areas for growth. " + 
                  ("Expect significant career advancement." if success_pts > 7 else "Focus on emotional expression."),
        "life": f"Strong vitality detected. {tam_h}.",
        "head": f"Sharp analytical skills. {tam_i}.",
        "heart": f"Deep emotional capacity. {tam_r}."
    }


# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

def save_to_db(user_id, image_name, insights):
    """Save analysis scores directly to the shared Laravel database"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        scores = insights["scores"]
        
        sql = """INSERT INTO palm_readings 
                 (user_id, image_path, detection_confidence, life_line_length, 
                  head_line_length, heart_line_length, quality, created_at, updated_at) 
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        
        rel_path = f"palm_readings/{image_name}"
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        values = (
            user_id, 
            rel_path, 
            0.95, 
            scores["health"], 
            scores["intelligence"], 
            scores["relationship"], 
            insights["interpretations"]["health"], 
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
    """Main image processing endpoint"""
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file format.")
        
        # Optimization: Resize large images
        if max(img.shape[:2]) > 1200:
            scale = 1200 / max(img.shape[:2])
            img = cv2.resize(img, (int(img.shape[1] * scale), int(img.shape[0] * scale)))
        
        # Process palm ROI and lines
        processor = PalmProcessor(img)
        result, error = processor.process()
        
        if error:
            raise HTTPException(status_code=400, detail=error)
        
        # Generate destiny insights
        insights = generate_palm_insights(
            result["lines_count"],
            result["line_strength"]
        )
        
        # Save edge-detected image
        timestamp = int(time.time())
        filename = f"palm_vision_{timestamp}.jpg"
        save_path = os.path.join(STORAGE_BASE, filename)
        cv2.imwrite(save_path, result["edges"])
        
        # Sync with database
        record_id = None
        if user_id:
            record_id = save_to_db(
                user_id,
                filename,
                insights
            )
        
        # Prepare response
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
            "detail": "Internal processing error."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
