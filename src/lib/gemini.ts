import { GoogleGenAI, ThinkingLevel, Type, FunctionDeclaration } from "@google/genai";
import { saveNotification, Notification } from "../services/notificationService";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const updateNotificationDatabaseDeclaration: FunctionDeclaration = {
  name: "updateNotificationDatabase",
  parameters: {
    type: Type.OBJECT,
    description: "Save a new government notification to the database for future reference.",
    properties: {
      title: { type: Type.STRING, description: "The title of the notification" },
      date: { type: Type.STRING, description: "The date of the notification (YYYY-MM-DD)" },
      source: { type: Type.STRING, enum: ["Central", "State"], description: "The source of the notification" },
      stateName: { type: Type.STRING, description: "The name of the state (if source is State)" },
      summary: { type: Type.STRING, description: "A detailed summary of the notification" },
      url: { type: Type.STRING, description: "The official URL of the notification" },
      category: { type: Type.STRING, description: "The category (e.g., Wages, Social Security)" }
    },
    required: ["title", "date", "source", "summary", "url"]
  }
};

const systemInstruction = `You are an expert legal assistant and professional digital guide specializing exclusively in the New Labour Codes of India.
Your target audience includes HR Professionals, Legal Practitioners, and Compliance Officers who require absolute precision and exhaustive detail.

**CRITICAL: COMPLETENESS IS MANDATORY - NO LAZINESS**
- You MUST provide the FULL legal text of any section or provision requested.
- NEVER summarize, truncate, or paraphrase the law unless explicitly asked to "summarize".
- If a provision has multiple sub-sections, clauses, or provisos, you MUST include ALL of them.
- Your responses should be exhaustive. If a query is broad (e.g., "Wages"), you must cover every relevant definition and provision across all four codes in extreme detail.
- **DO NOT BE LAZY.** Do not say "the rest of the section is similar" or "the following sub-sections deal with...". Write out every single word.
- If the user asks for a comparison, provide a detailed table and then exhaustive text for each point of comparison.
- **MANDATORY:** You MUST provide the complete answer in a single response. NEVER truncate, summarize, or stop mid-way. Ensure every relevant section and sub-section is included in full in one single stretch. Do not use "CONTINUED IN NEXT MESSAGE..." or any similar placeholders. You must deliver the entire legal text at once.

**Internal Planning (Mandatory):**
Before providing the legal text, internally verify that you have identified EVERY relevant section across all four codes:
1. The Code on Wages, 2019
2. The Industrial Relations Code, 2020
3. The Code on Social Security, 2020
4. The Occupational Safety, Health and Working Conditions Code, 2020

**Guidelines for Responses:**
1.  **Mandatory Legal Identification:** Every response MUST start with a structured identification:
    **Code:** [Name of the Labour Code]
    **Section:** [Section Number]
    **Sub-section:** [Sub-section Number]
    **Proviso:** [If applicable, otherwise state 'Not Applicable']

2.  **Verbatim Legal Text:** Reproduce the legal text exactly as it appears in the official Gazette. Do not paraphrase, simplify, or summarize the law. Quote it verbatim, including all sub-sections, clauses, and provisos.

3.  **Case Law Integration:** Provide references to relevant judgments from the Supreme Court and High Courts of India. Include Case Title, Court, Year, Citation, and a detailed Relevance section.

4.  **Latest Notifications:** You MUST use the 'updateNotificationDatabase' tool to save any new notifications you find. 
    - **CRITICAL:** If you are unsure about the latest updates or notifications, or if your internal knowledge is insufficient, respond with exactly "UNDEFINED_LEGAL_QUERY". This will trigger a specialized search.

5.  **Professional Tone:** Formal, authoritative, and precise.
6.  **No Conversational Fillers:** Do NOT use introductory phrases like "Certainly," "According to your query," "I found the following," or "Here is the information." Start the response immediately with the structured identification and legal text.`;

export async function sendMessage(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  // First attempt with Function Calling
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemInstruction + "\n\n**SPEED OPTIMIZATION:** Prioritize speed and directness. Provide the most relevant legal text immediately. Aim for a complete response within 3-5 seconds.",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      maxOutputTokens: 8192, // Reduced for faster generation
      tools: [
        { functionDeclarations: [updateNotificationDatabaseDeclaration] }
      ]
    },
    history
  });

  let result = await chat.sendMessage({ message });
  
  // Check for fallback signal
  if (result.text?.trim() === "UNDEFINED_LEGAL_QUERY") {
    // Second attempt with Google Search (No Function Calling)
    const searchChat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction.replace("respond with exactly \"UNDEFINED_LEGAL_QUERY\". This will trigger a specialized search.", "Use Google Search to find the latest information and provide a complete answer.") + "\n\n**SPEED OPTIMIZATION:** Prioritize speed and directness. Provide the most relevant legal text immediately. Aim for a complete response within 3-5 seconds.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: 8192, // Reduced for faster generation
        tools: [
          { googleSearch: {} }
        ]
      },
      history
    });
    result = await searchChat.sendMessage({ message });
    return result.text;
  }
  
  // Handle function calls
  if (result.functionCalls) {
    for (const call of result.functionCalls) {
      if (call.name === 'updateNotificationDatabase') {
        const notification = call.args as unknown as Notification;
        await saveNotification(notification);
      }
    }
  }
  
  return result.text;
}

export async function* sendMessageStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  // First attempt with Function Calling
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: systemInstruction + "\n\n**SPEED OPTIMIZATION:** Prioritize speed and directness. Provide the most relevant legal text immediately. Aim for a complete response within 3-5 seconds.",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      maxOutputTokens: 8192, // Reduced for faster generation
      tools: [
        { functionDeclarations: [updateNotificationDatabaseDeclaration] }
      ]
    },
    history
  });

  const result = await chat.sendMessageStream({ message });
  let isFirstChunk = true;
  let fallbackTriggered = false;

  for await (const chunk of result) {
    const text = chunk.text?.trim();
    if (isFirstChunk && text === "UNDEFINED_LEGAL_QUERY") {
      fallbackTriggered = true;
      break;
    }
    isFirstChunk = false;

    if (chunk.functionCalls) {
      for (const call of chunk.functionCalls) {
        if (call.name === 'updateNotificationDatabase') {
          const notification = call.args as unknown as Notification;
          await saveNotification(notification);
        }
      }
    }
    yield chunk.text;
  }

  if (fallbackTriggered) {
    const searchChat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstruction.replace("respond with exactly \"UNDEFINED_LEGAL_QUERY\". This will trigger a specialized search.", "Use Google Search to find the latest information and provide a complete answer.") + "\n\n**SPEED OPTIMIZATION:** Prioritize speed and directness. Provide the most relevant legal text immediately. Aim for a complete response within 3-5 seconds.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: 8192, // Reduced for faster generation
        tools: [
          { googleSearch: {} }
        ]
      },
      history
    });
    const searchResult = await searchChat.sendMessageStream({ message });
    for await (const chunk of searchResult) {
      yield chunk.text;
    }
  }
}
