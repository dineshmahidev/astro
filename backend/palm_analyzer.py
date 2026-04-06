import cv2
import mediapipe as mp
import numpy as np
import base64
import sys
import json
import os

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5)

def analyze_palm_image(img_path):
    # Load image
    image = cv2.imread(img_path)
    if image is None:
        return {"error": "Could not read image"}

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    if not results.multi_hand_landmarks:
        return {
            "is_palm": False,
            "message": "No hand detected in the image. Please show your palm clearly.",
            "metrics": None
        }

    # If hand detected, getlandmarks
    hand_landmarks = results.multi_hand_landmarks[0]
    
    # Heuristic: Check palm orientation by looking at landmarks 0, 5, 17
    # (Simplified: if hand detected, we assume it's a palm for now)
    
    h, w, c = image.shape
    landmarks = []
    for lm in hand_landmarks.landmark:
        landmarks.append((int(lm.x * w), int(lm.y * h)))

    # Metrics (Pseudo-analysis based on landmarks)
    # 0: Wrist, 5: Index base, 17: Pinky base
    # Length of "Life line area" roughly corresponds to distance 0-5
    # Length of "Heart line area" roughly corresponds to distance 5-17
    
    life_line_raw = np.linalg.norm(np.array(landmarks[0]) - np.array(landmarks[5]))
    heart_line_raw = np.linalg.norm(np.array(landmarks[5]) - np.array(landmarks[17]))
    
    # Scale them to 0-10 relative to hand size
    hand_size = np.linalg.norm(np.array(landmarks[0]) - np.array(landmarks[9])) # Wrist to start of Middle Finger
    
    life_line_score = min(max((life_line_raw / hand_size) * 7.5, 3), 9.5)
    heart_line_score = min(max((heart_line_raw / hand_size) * 8.0, 4), 9.0)
    
    # Determine type
    head_line_type = "curved" if landmarks[5][0] < landmarks[9][0] else "straight" # Very simple heuristic

    return {
        "is_palm": True,
        "message": "Palm detected successfully.",
        "confidence": results.multi_handedness[0].classification[0].score,
        "metrics": {
            "life_line_length": round(life_line_score, 2),
            "heart_line_length": round(heart_line_score, 2),
            "head_line_type": head_line_type,
            "fate_line_present": life_line_score > 6.0, # Guessing
            "hand_side": results.multi_handedness[0].classification[0].label
        }
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
        
    img_path = sys.argv[1]
    result = analyze_palm_image(img_path)
    print(json.dumps(result))
