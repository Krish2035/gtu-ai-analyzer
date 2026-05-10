/**
 * Directly calls the Groq API from the browser.
 * NOTE: Requires VITE_GROQ_API_KEY to be set in Vercel/Env.
 */
export const getAiExplanation = async (topic, subject) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  const prompt = `You are Lumina AI, an expert engineering tutor for Gujarat Technological University (GTU). 
  Break down the following topic from the subject "${subject}": "${topic}".
  
  Guidelines:
  1. Use clear, simple language suitable for engineering students.
  2. Use Markdown for formatting (bolding, lists).
  3. Include a Mermaid diagram if the topic is a process, architecture, or algorithm (use \`\`\`mermaid blocks).
  4. Keep the explanation concise but detailed enough for a 7-mark GTU question.
  5. Add a "GTU Exam Tip" at the end.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "API_ERROR");
  }

  const data = await response.json();
  return data.choices[0].message.content;
};
