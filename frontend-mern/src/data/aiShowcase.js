export const aiShowcase = {
  "State and explain Kirchhoff's Laws.": `### ⚡ Kirchhoff's Circuit Laws
Kirchhoff's laws are fundamental to circuit analysis, dealing with the conservation of charge and energy in electrical networks.

#### 1. Kirchhoff's Current Law (KCL)
**Statement:** The algebraic sum of currents entering a node (or junction) is exactly equal to the algebraic sum of currents leaving that node.
*   **Principle:** Conservation of Charge.
*   **Equation:** $\\sum I_{in} = \\sum I_{out}$

#### 2. Kirchhoff's Voltage Law (KVL)
**Statement:** The algebraic sum of all electrical potential differences (voltages) around any closed network (loop) is zero.
*   **Principle:** Conservation of Energy.
*   **Equation:** $\\sum V = 0$

\`\`\`mermaid
graph TD
    A[Node/Junction] -->|Current In| B(KCL)
    B -->|Current Out| C[Conservation of Charge]
    D[Closed Loop] -->|Voltage Drops| E(KVL)
    E -->|Voltage Sources| F[Conservation of Energy]
\`\`\`

---
**GTU Exam Tip:** Always define the direction of current (clockwise/anti-clockwise) before applying KVL equations!`,

  "Define RMS Value and Form Factor.": `### 📊 RMS Value & Form Factor
These are critical parameters for alternating current (AC) analysis.

#### Root Mean Square (RMS) Value
The RMS value of an AC is that value of steady current (DC) which, when flowing through a given resistance for a given time, produces the same amount of heat as produced by the AC.
*   **Formula:** $I_{rms} = \\frac{I_m}{\\sqrt{2}} \\approx 0.707 \\times I_m$

#### Form Factor
It is the ratio of the RMS value to the Average value of an alternating quantity.
*   **Formula:** $k_f = \\frac{RMS \\text{ Value}}{Average \\text{ Value}}$
*   **For Sine Wave:** $k_f = 1.11$

---
**High Priority:** Frequently asked in 3-mark questions!`,

  "Explain the RSA Algorithm.": `### 🔐 RSA Encryption Algorithm
RSA (Rivest–Shamir–Adleman) is a public-key cryptosystem that is widely used for secure data transmission.

#### How it Works:
1.  **Key Generation:** Choose two large prime numbers $p$ and $q$.
2.  **Compute n:** $n = p \\times q$.
3.  **Public Key:** $(e, n)$ where $e$ is the encryption exponent.
4.  **Private Key:** $(d, n)$ where $d$ is the decryption exponent.

\`\`\`mermaid
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Send Public Key (e, n)
    Bob->>Bob: Encrypt Message: C = M^e mod n
    Bob->>Alice: Send Ciphertext (C)
    Alice->>Alice: Decrypt Message: M = C^d mod n
\`\`\`

---
**High Priority:** This topic appears in almost every **Information Security** paper!`,

  "What is Normalization? Explain 1NF, 2NF, and 3NF.": `### 📊 Database Normalization
Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity.

| Level | Requirement |
| :--- | :--- |
| **1NF** | Atomic values, No repeating groups |
| **2NF** | In 1NF + No partial dependencies |
| **3NF** | In 2NF + No transitive dependencies |

\`\`\`mermaid
graph LR
    A[Unnormalized] --> B[1NF]
    B --> C[2NF]
    C --> D[3NF]
    D --> E[BCNF]
\`\`\`
`
};
