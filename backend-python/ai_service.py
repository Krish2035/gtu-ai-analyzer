from groq import Groq
import os

# Configure your Groq API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables")
client = Groq(api_key=GROQ_API_KEY)

def get_ai_answer(topic_name, subject_name):
    prompt = f"Explain the topic '{topic_name}' for the subject '{subject_name}' in the context of GTU exams. Provide a concise 7-mark level answer with key points."
    
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content