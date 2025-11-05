import { GoogleGenAI, Type } from "@google/genai";
import type { ResumeData, AIFeedback } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const formatFeedback = (feedback: AIFeedback[]): string => {
  if (feedback.length === 0) return "";
  const examples = feedback.map(f => 
    `AI-Generated:\n"${f.original}"\nUser-Edited:\n"${f.edited}"`
  ).join('\n---\n');
  return `\n\nTo better match the user's preferred style, learn from these examples of their previous edits:\n${examples}`;
}

export async function generateSummary(resumeData: ResumeData, feedback: AIFeedback[]): Promise<string> {
  const { experience, skills } = resumeData;
  const feedbackPrompt = formatFeedback(feedback);
  const prompt = `
    Act as a professional resume writer. Based on the following career details, write a concise, impactful, and ATS-friendly professional summary of 2-4 sentences.
    
    Work Experience:
    ${experience.map(e => `- ${e.jobTitle} at ${e.company}`).join('\n')}
    
    Skills:
    ${skills.map(s => s.name).join(', ')}
    ${feedbackPrompt}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
}

export async function analyzeResume(resumeData: ResumeData, jobDescription: string): Promise<{ score: number; analysis: string; suggestions: string[] }> {
    const resumeText = `
        Summary: ${resumeData.personalInfo.summary}
        Experience: ${resumeData.experience.map(e => `${e.jobTitle}: ${e.description}`).join('\n')}
        Skills: ${resumeData.skills.map(s => s.name).join(', ')}
    `;

    const prompt = `
        Act as an expert career coach and ATS analyst. Analyze the following resume against the provided job description.
        Provide a match score from 1-100, a brief analysis explaining the score, and 3 concrete, actionable suggestions for improvement.

        Resume Text:
        ---
        ${resumeText}
        ---

        Job Description:
        ---
        ${jobDescription}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: {
                            type: Type.NUMBER,
                            description: "A match score between 1 and 100 representing how well the resume matches the job description.",
                        },
                        analysis: {
                            type: Type.STRING,
                            description: "A brief analysis explaining the reasoning behind the score.",
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: "An array of 3 actionable suggestions for improving the resume.",
                        },
                    },
                    required: ["score", "analysis", "suggestions"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error analyzing resume:", error);
        throw new Error("Failed to analyze resume with the AI model.");
    }
}

export async function checkATSCompatibility(resumeData: ResumeData): Promise<{ score: number; analysis: string; suggestions: string[] }> {
    const resumeText = `
        Name: ${resumeData.personalInfo.name}
        Summary: ${resumeData.personalInfo.summary}
        
        Experience:
        ${resumeData.experience.map(e => `- ${e.jobTitle} at ${e.company}: ${e.description.replace(/\n/g, ' ')}`).join('\n')}
        
        Education:
        ${resumeData.education.map(e => `- ${e.degree} from ${e.institution}`).join('\n')}

        Skills:
        ${resumeData.skills.map(s => s.name).join(', ')}
    `;

    const prompt = `
        Act as an advanced Applicant Tracking System (ATS) simulator and expert resume reviewer. 
        Analyze the following resume for ATS compatibility and overall effectiveness. 
        Evaluate it on key criteria such as keyword optimization (for general roles related to the experience), formatting, clarity, and use of action verbs.

        Provide a compatibility score from 1-100, a brief analysis explaining the score, and 3-5 concrete, actionable suggestions for improvement. The suggestions should be specific and easy to implement.

        Resume Text:
        ---
        ${resumeText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: {
                            type: Type.NUMBER,
                            description: "An ATS compatibility score between 1 and 100.",
                        },
                        analysis: {
                            type: Type.STRING,
                            description: "A brief analysis explaining the reasoning behind the score, highlighting strengths and weaknesses.",
                        },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: "An array of 3-5 actionable suggestions for improving the resume's ATS compatibility.",
                        },
                    },
                    required: ["score", "analysis", "suggestions"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error checking ATS compatibility:", error);
        throw new Error("Failed to check ATS compatibility with the AI model.");
    }
}