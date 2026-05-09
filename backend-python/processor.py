import fitz  # PyMuPDF
import os
import re

def get_imps_for_subject(subject_name):
    path = f"../GTU_data/{subject_name}" 
    if not os.path.exists(path):
        return [{"topic": "Folder not found", "priority": "Error"}]

    # 1. THE "SYLLABUS ANCHOR": Define the real topics for the subject
    # This ensures "Explain" or "07" never show up as topics.
    subject_map = {
        "AI": [
            "Water Jug", "Best First Search", "A* Algorithm", "AO* Algorithm", 
            "Minimax", "Alpha Beta Pruning", "Constraint Satisfaction", 
            "Predicate Logic", "Forward Reasoning", "Backward Reasoning", 
            "Semantic Net", "Expert System", "Neural Network", "NLP", 
            "Hill Climbing", "State Space Search", "Resolution", "Fuzzy Logic"
        ],
        "ML": ["Linear Regression", "Decision Tree", "SVM", "K-Means", "Neural Networks"]
    }

    # Get the specific list for the clicked subject, or empty list if not defined
    keywords = subject_map.get(subject_name.upper(), [])
    
    all_papers_text = []
    pdf_files = [f for f in os.listdir(path) if f.endswith(".pdf")]
    
    # 2. Extract and Clean: Skip the "Pink Border" header
    for file in pdf_files:
        try:
            doc = fitz.open(os.path.join(path, file))
            file_content = ""
            for page in doc:
                text = page.get_text()
                # Splitting at 'Instructions' removes the GTU Header/Subject Code
                clean_text = text.split("Instructions")[-1] if "Instructions" in text else text
                file_content += " " + clean_text.lower()
            all_papers_text.append(file_content)
        except Exception as e:
            print(f"Error: {e}")

    results = []
    
    # 3. THE "2-PAPER" RULE: Only keep topics appearing in multiple years
    for topic in keywords:
        paper_count = 0
        has_seven_marks = False
        
        for paper in all_papers_text:
            if topic.lower() in paper:
                paper_count += 1
                # Regex: Look for the topic followed by '07' within 150 characters
                if re.search(rf"{topic.lower()}.{{0,150}}07", paper):
                    has_seven_marks = True

        # Only add to results if it appears in 2 or more papers
        if paper_count >= 2:
            results.append({
                "topic": topic,
                "priority": "Critical (7-Mark)" if has_seven_marks else "High (4-Mark)",
                "score": paper_count + (5 if has_seven_marks else 0)
            })

    # Sort so the most frequent 7-mark questions are at the top
    return sorted(results, key=lambda x: x['score'], reverse=True)