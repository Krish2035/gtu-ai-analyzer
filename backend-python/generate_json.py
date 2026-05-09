import fitz  # PyMuPDF
import os
import re
import json

def get_perfect_imps(subject_folder_name, syllabus_map):
    path = f"../GTU_data/{subject_folder_name}"
    if not os.path.exists(path):
        return []

    # NORMALIZATION: Converts folder name to Uppercase with no spaces/dashes
    # Example: "Maths - I" becomes "MATHSI"
    clean_name = subject_folder_name.upper().strip().replace("-", "").replace(" ", "")
    
    # Get keywords for this subject
    valid_topics = syllabus_map.get(clean_name, [])
    
    if not valid_topics:
        print(f"⚠️ Skipping {subject_folder_name}: No keywords defined for key '{clean_name}'")
        return []

    pdf_files = [f for f in os.listdir(path) if f.endswith(".pdf")]
    paper_contents = []

    for file in pdf_files:
        try:
            doc = fitz.open(os.path.join(path, file))
            file_text = ""
            for page in doc:
                text = page.get_text()
                # Remove header noise
                content = text.split("Instructions")[-1] if "Instructions" in text else text
                file_text += " " + content.lower()
            paper_contents.append(file_text)
        except Exception as e:
            print(f"❌ Error reading {file}: {e}")
            continue

    results = []
    for topic in valid_topics:
        count = 0
        is_seven_mark = False
        
        for paper in paper_contents:
            if topic.lower() in paper:
                count += 1
                # Check for 7-mark keywords near the topic
                if re.search(rf"{topic.lower()}.{{0,200}}(07|7\smarks)", paper):
                    is_seven_mark = True

        # TOPIC DISCOVERY RULE: Must appear in at least 2 papers
        if count >= 2:
            results.append({
                "topic": topic,
                "priority": "Critical (7-Mark)" if is_seven_mark else "High (4-Mark)",
                "occurrence": count
            })

    return sorted(results, key=lambda x: (x['priority'], x['occurrence']), reverse=True)

if __name__ == "__main__":
    syllabus_map = {
        # --- NEW SUBJECTS REQUESTED ---
        "AJP": ["Servlet Life Cycle", "JSP Implicit Objects", "JDBC Driver Types", "RMI", "EJB", "Hibernate", "Spring"],
        "CD": ["Lexical Analysis", "Syntax Analysis", "Parsing", "LL(1) Parser", "LR Parser", "Symbol Table", "Optimization"],
        "DF": ["Digital Evidence", "Cyber Crime", "Steganography", "Hashing", "Disk Imaging", "File Recovery"],
        "DM": ["Data Warehouse", "OLAP", "Apriori Algorithm", "Association Rule", "Classification", "Clustering"],
        "MPI": ["8085 Architecture", "8086 Architecture", "Addressing Modes", "Interrupts", "8255 PPI", "DMA"],
        "PE": ["Professional Ethics", "Values", "Work Ethics", "Engineering Ethics", "Social Responsibility"],
        "PEM": ["Project Management", "Financial Management", "Marketing", "Entrepreneurship", "Economics"],
        "PHYSICS": ["Laser", "Fiber Optics", "Quantum Mechanics", "Ultrasonics", "Nanotechnology", "Superconductivity"],
        "PS": ["Probability", "Normal Distribution", "Sampling", "Hypothesis Testing", "Correlation", "Regression"],

        # --- PREVIOUS SUBJECTS ---
        "MATHSI": ["Matrix", "Rank of Matrix", "Eigen Values", "Taylor Series", "Multiple Integral"],
        "MATHSII": ["Differential Equation", "Laplace Transform", "Fourier Series", "Vector Calculus"],
        "PPS": ["Flowchart", "Algorithm", "Loops", "Arrays", "Pointers", "Structure"],
        "BEE": ["Kirchhoffs Laws", "KVL", "KCL", "Thevenins Theorem", "Transformer", "DC Motor"],
        "BME": ["First Law of Thermodynamics", "IC Engine", "Boilers", "Pumps", "Refrigeration"],
        "EGD": ["Projections of Points", "Projections of Lines", "Isometric Projection"],
        "WP": ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "XML", "JSON", "DOM", "AJAX"],
        "OOPI": ["Inheritance", "Interface", "Exception Handling", "Multithreading", "JDBC", "Servlet", "JSP"],
        "PYTHON": ["List Comprehension", "Dictionary", "Tuple", "Lambda", "Pandas", "NumPy", "Matplotlib"],
        "COA": ["Pipelining", "Cache Memory", "Virtual Memory", "Interrupts", "DMA"],
        "IS": ["RSA", "DES", "AES", "Firewall", "Digital Signature", "Phishing"],
        "IOT": ["IoT Architecture", "MQTT", "Arduino", "Raspberry Pi", "Sensors"],
        "ADA": ["Asymptotic Notation", "Merge Sort", "Quick Sort", "Knapsack", "Dijkstra", "Prims", "Kruskals"],
        "AI": ["Water Jug", "A* Algorithm", "AO* Algorithm", "Heuristic Search", "Hill Climbing"],
        "CC": ["SaaS", "PaaS", "IaaS", "Virtualization", "Hypervisor", "AWS", "Azure"],
        "CN": ["OSI Model", "TCP/IP", "IP Addressing", "Subnetting", "Routing", "CRC"],
        "DBMS": ["ER Diagram", "Normalization", "SQL", "ACID", "Concurrency Control"],
        "DS": ["Stack", "Queue", "Linked List", "Binary Tree", "AVL Tree", "Graph"],
        "ML": ["Supervised Learning", "Linear Regression", "Logistic Regression", "Decision Tree", "Random Forest"],
        "OS": ["Process Scheduling", "Deadlock", "Bankers Algorithm", "Paging", "Semaphore"],
        "SE": ["Waterfall Model", "Agile", "SRS", "DFD", "Testing", "COCOMO"],
        "TOC": ["DFA", "NFA", "Regular Expression", "CFG", "PDA", "Turing Machine"]
    }

    gtu_path = "../GTU_data"
    
    if os.path.exists(gtu_path):
        folders = [f for f in os.listdir(gtu_path) if os.path.isdir(os.path.join(gtu_path, f))]
        for folder in folders:
            data = get_perfect_imps(folder, syllabus_map)
            output_path = os.path.join(gtu_path, folder, "predictions.json")
            with open(output_path, "w") as f:
                json.dump({"subject": folder, "predictions": data}, f, indent=2)
            print(f"✅ Generated: {output_path} ({len(data)} topics found)")

    print("\n✨ ALL SUBJECTS UPDATED. Restart your FastAPI server now.")