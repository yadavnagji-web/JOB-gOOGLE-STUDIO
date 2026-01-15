
import { GoogleGenAI, Type } from "@google/genai";
import { JobStatus, ContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const extractJobData = async (rawText: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert Government Recruitment Automation Architect. 
    Analyze the following notification text (often from RajasthanCareers.in or official boards) and extract highly accurate JSON data.

    AUTHENTICITY RULES:
    1. SOURCE IDENTIFICATION: Search for boards like "RPSC", "RSMSSB", "Rajasthan Police", "UPSC", "SSC", "IBPS". 
    2. RAJASTHAN FOCUS: If the notification is from RajasthanCareers.in, it is likely a Rajasthan or Central job relevant to Rajasthan candidates.
    3. CATEGORY: Strictly classify as "JOB", "RESULT", "ADMIT_CARD", or "ADMISSION".
    4. STATE: Correctly identify the State. Use "Central" for Union Govt jobs.
    5. VACANCIES: Extract the total number of posts if available.

    Input Text: ${rawText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          job_title: { type: Type.STRING },
          department: { type: Type.STRING },
          post_name: { type: Type.STRING },
          qualification: { type: Type.STRING },
          age_limit: { type: Type.STRING },
          total_posts: { type: Type.NUMBER },
          start_date: { type: Type.STRING },
          last_date: { type: Type.STRING },
          apply_link: { type: Type.STRING },
          category: { type: Type.STRING },
          is_center_level: { type: Type.BOOLEAN },
          state: { type: Type.STRING },
          source_name: { type: Type.STRING },
          is_authentic_board: { type: Type.BOOLEAN },
          eligibility_details: { type: Type.STRING },
          how_to_apply_steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          content_type: { type: Type.STRING, enum: ["JOB", "RESULT", "ADMIT_CARD", "ADMISSION", "NEWS"] },
          is_valid: { type: Type.BOOLEAN }
        },
        required: ["job_title", "department", "post_name", "qualification", "age_limit", "total_posts", "start_date", "last_date", "apply_link", "category", "is_center_level", "state", "source_name", "is_authentic_board", "eligibility_details", "how_to_apply_steps", "content_type", "is_valid"]
      }
    }
  });

  try {
    const text = response.text.trim();
    if (!text || text === '{}') return null;
    
    const data = JSON.parse(text);
    if (data.is_valid === false) return null;

    return {
      ...data,
      id: `auto-${Math.random().toString(36).substr(2, 9)}`,
      status: JobStatus.APPROVED,
      created_at: new Date().toISOString(),
      notification_pdf_url: data.apply_link || "#"
    };
  } catch (error) {
    console.error("Gemini Automation Extraction Error:", error);
    return null;
  }
};
