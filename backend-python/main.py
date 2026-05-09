from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import sqlite3
import uuid
import shutil
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from fastapi import Depends, status, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from database import get_db_connection
from auth import get_password_hash, verify_password, create_access_token, verify_token

app = FastAPI()

# --- 1. CONFIGURATION ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    # We don't raise error here to allow health checks, but log it
    print("Warning: GROQ_API_KEY not found in environment variables")
client = Groq(api_key=GROQ_API_KEY)

# Local caching folder to save your API quota
CACHE_DIR = "ai_cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

SYSTEM_PROMPT = (
    "You are a Senior Professor at Gujarat Technological University (GTU) specializing in Engineering. "
    "Your objective is to provide comprehensive, structured answers that would score a perfect 7/7 marks in GTU exams. "
    "For every topic, you MUST follow this precise structure:\n\n"
    "1. **TECHNICAL DEFINITION**: Provide a formal, high-level definition of the topic (3-4 lines).\n\n"
    "2. **VISUAL ARCHITECTURE**: If the topic allows for a diagram, provide it using Mermaid.js. "
    "YOU MUST use a code block tagged as 'mermaid'. Inside the block, start directly with the diagram type (e.g., `graph TD`). "
    "CRITICAL RULES:\n"
    "- Always wrap all node labels in double quotes (e.g., `A[\"Technical Label\"]`).\n"
    "- For edges with text, use ONLY this syntax: `A -->|label| B`. Do NOT add extra arrows like `-->|label|> B` or `-->|label| > B`.\n"
    "If a diagram is not applicable, provide a high-quality bulleted architectural breakdown.\n\n"
    "3. **DETAILED WORKING/MECHANISM**: Explain 'how it works' in clear, logical steps. Use bold keywords.\n\n"
    "4. **TECHNICAL SPECIFICATIONS/TYPES**: List key components, categories, or variations of the topic.\n\n"
    "5. **ADVANTAGES & DISADVANTAGES**: Provide a balanced technical comparison.\n\n"
    "6. **EXAM TIP**: Add a 'Pro-Tip' for how to draw this in a physical paper or what specific GTU keywords to include.\n\n"
    "CRITICAL: Use Markdown for all formatting. Be technical, accurate, and professional."
)

# --- 2. ENABLE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your React app on 5173 to talk to this server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. SERVE GTU DATA ---
script_dir = os.path.dirname(os.path.abspath(__file__))
# Adjusted to find your 'GTU_data' folder outside the backend folder
data_path = os.path.normpath(os.path.join(script_dir, "..", "GTU_data"))

if os.path.exists(data_path):
    app.mount("/api/static", StaticFiles(directory=data_path), name="static")
    print(f"Serving GTU data from: {data_path}")
else:
    print(f"Warning: {data_path} not found. Check your folder structure.")

# --- 3.5 AUTH & USER ENDPOINTS ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    conn = get_db_connection()
    user = conn.execute('SELECT id, name, enrollment, email, profile_photo FROM users WHERE email = ?', (payload.get("sub"),)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return dict(user)

class SignupData(BaseModel):
    name: str
    enrollment: str
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

class ProfileUpdateData(BaseModel):
    name: str

class PasswordUpdateData(BaseModel):
    old_password: str
    new_password: str

class ReminderData(BaseModel):
    title: str
    date: str

class StudyActivityData(BaseModel):
    subject_name: str
    duration_minutes: int
    day_of_week: str

@app.post("/api/auth/signup")
def signup(data: SignupData):
    conn = get_db_connection()
    try:
        hashed_pw = get_password_hash(data.password)
        conn.execute('INSERT INTO users (name, enrollment, email, hashed_password) VALUES (?, ?, ?, ?)',
                     (data.name, data.enrollment, data.email, hashed_pw))
        conn.commit()
        return {"message": "User created successfully"}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email or Enrollment already exists")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/auth/login")
def login(data: LoginData):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (data.email,)).fetchone()
    conn.close()
    
    if not user or not verify_password(data.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"sub": user['email']})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/api/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.put("/api/users/profile")
def update_profile(data: ProfileUpdateData, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    conn.execute('UPDATE users SET name = ? WHERE id = ?', (data.name, current_user['id']))
    conn.commit()
    conn.close()
    return {"message": "Profile updated successfully"}

@app.put("/api/users/password")
def update_password(data: PasswordUpdateData, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    user = conn.execute('SELECT hashed_password FROM users WHERE id = ?', (current_user['id'],)).fetchone()
    
    if not user or not verify_password(data.old_password, user['hashed_password']):
        conn.close()
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    hashed_pw = get_password_hash(data.new_password)
    conn.execute('UPDATE users SET hashed_password = ? WHERE id = ?', (hashed_pw, current_user['id']))
    conn.commit()
    conn.close()
    return {"message": "Password updated successfully"}

@app.get("/api/users/reminders")
def get_reminders(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    reminders = conn.execute('SELECT * FROM reminders WHERE user_id = ? ORDER BY id DESC', (current_user['id'],)).fetchall()
    conn.close()
    return {"reminders": [dict(r) for r in reminders]}

@app.post("/api/users/reminders")
def add_reminder(data: ReminderData, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    conn.execute('INSERT INTO reminders (user_id, title, date) VALUES (?, ?, ?)', (current_user['id'], data.title, data.date))
    conn.commit()
    conn.close()
    return {"message": "Reminder added successfully"}

@app.delete("/api/users/reminders/{reminder_id}")
def delete_reminder(reminder_id: int, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    conn.execute('DELETE FROM reminders WHERE id = ? AND user_id = ?', (reminder_id, current_user['id']))
    conn.commit()
    conn.close()
    return {"message": "Reminder deleted successfully"}

@app.get("/api/users/study-activity")
def get_study_activity(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    activities = conn.execute('''
        SELECT day_of_week, SUM(duration_minutes) as total_minutes, GROUP_CONCAT(DISTINCT subject_name) as subjects
        FROM study_activity
        WHERE user_id = ?
        GROUP BY day_of_week
    ''', (current_user['id'],)).fetchall()
    conn.close()
    return {"activities": [dict(a) for a in activities]}

@app.post("/api/users/study-activity")
def add_study_activity(data: StudyActivityData, current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    existing = conn.execute('SELECT id FROM study_activity WHERE user_id = ? AND subject_name = ? AND day_of_week = ?', 
                            (current_user['id'], data.subject_name, data.day_of_week)).fetchone()
    if existing:
        conn.execute('UPDATE study_activity SET duration_minutes = duration_minutes + ? WHERE id = ?', 
                     (data.duration_minutes, existing['id']))
    else:
        conn.execute('INSERT INTO study_activity (user_id, subject_name, duration_minutes, day_of_week) VALUES (?, ?, ?, ?)', 
                     (current_user['id'], data.subject_name, data.duration_minutes, data.day_of_week))
    conn.commit()
    conn.close()
    return {"message": "Activity logged"}

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/api/users/upload_avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    conn = get_db_connection()
    conn.execute('UPDATE users SET profile_photo = ? WHERE id = ?', (f"http://localhost:8000/uploads/{filename}", current_user['id']))
    conn.commit()
    conn.close()
    return {"message": "Avatar uploaded", "profile_photo": f"http://localhost:8000/uploads/{filename}"}

# --- 4. AI ENDPOINT WITH CACHING ---
@app.get("/api/explain")
async def explain_topic(topic: str, subject: str):
    # Sanitize subject and hash topic for a perfectly safe filename
    import hashlib
    safe_subject = "".join([c if c.isalnum() or c in "._-" else "_" for c in subject])
    topic_hash = hashlib.md5(topic.encode('utf-8')).hexdigest()
    cache_filename = f"{safe_subject}_{topic_hash}.json"
    cache_path = os.path.join(CACHE_DIR, cache_filename)

    # Step A: Check Cache First
    if os.path.exists(cache_path):
        print(f"Cache Hit: Loading {topic} from local storage.")
        with open(cache_path, "r") as f:
            return json.load(f)

    # Step B: Call Groq if not in cache
    try:
        print(f"Requesting AI for: {topic}...")
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Explain the topic '{topic}' for the subject '{subject}'."}
            ]
        )
        
        explanation = response.choices[0].message.content
        if not explanation:
            raise ValueError("Groq returned an empty response.")

        result = {"topic": topic, "explanation": explanation}

        # Step C: Save to Cache
        with open(cache_path, "w") as f:
            json.dump(result, f)

        return result
        
    except Exception as e:
        print(f"AI Error: {e}")
        # Return the actual error message for debugging
        raise HTTPException(status_code=500, detail=f"AI Service Error: {str(e)}")

@app.get("/")
def health_check():
    return {"status": "Lumina Backend Online", "engine": "Groq Llama 3.3"}

# --- 5. RUN SERVER ---
if __name__ == "__main__":
    import uvicorn
    # If port 8000 is blocked, run 'taskkill /F /PID <number>' first
    print("Starting Lumina Backend v2.0 (Hashed Caching Enabled) on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)