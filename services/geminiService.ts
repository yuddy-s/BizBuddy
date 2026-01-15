
import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialization - only create AI instance when needed and if API key exists
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  // Vite defines process.env.API_KEY and process.env.GEMINI_API_KEY via vite.config.ts
  const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY) as string | undefined;
  
  if (!ai && apiKey && apiKey !== 'undefined' && apiKey !== 'null' && apiKey.trim() !== '') {
    try {
      ai = new GoogleGenAI({ apiKey: apiKey });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI:", error);
      return null;
    }
  }
  return ai;
};

export interface BusinessInsight {
  title: string;
  content: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface MarketingCopy {
  subject: string;
  body: string;
}

export const getBusinessInsights = async (
  invoices: any[],
  transactions: any[],
  orgName: string
): Promise<BusinessInsight[]> => {
  const aiInstance = getAI();
  if (!aiInstance) {
    return [{
      title: "AI Insights Unavailable",
      content: "Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.",
      recommendation: "The app will work normally, but AI-powered insights will be disabled until the API key is set.",
      priority: "Low" as const
    }];
  }

  try {
    const summary = {
      totalRevenue: transactions.reduce((acc, t) => acc + Number(t.amount), 0),
      invoiceCount: invoices.length,
      paidRatio: invoices.filter(i => i.status === 'PAID').length / (invoices.length || 1),
      avgInvoice: invoices.reduce((acc, i) => acc + Number(i.total), 0) / (invoices.length || 1),
    };

    const prompt = `
      You are an expert automotive performance shop consultant. 
      Analyze the following data for "${orgName}":
      - Total Revenue: $${summary.totalRevenue}
      - Total Invoices: ${summary.invoiceCount}
      - Paid Invoice Ratio: ${(summary.paidRatio * 100).toFixed(1)}%
      - Average Invoice Value: $${summary.avgInvoice.toFixed(2)}

      Provide 3 actionable business insights or suggestions to increase shop efficiency, upsell performance parts, or improve cash flow.
    `;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              priority: { type: Type.STRING },
            },
            required: ["title", "content", "recommendation", "priority"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return [{
      title: "Data Analysis Paused",
      content: "We couldn't generate insights at this moment.",
      recommendation: "Check back later or ensure your business data is up to date.",
      priority: "Low"
    }];
  }
};

export const generateMarketingCopy = async (params: {
  purpose: string;
  context: string;
  tone: string;
}): Promise<MarketingCopy> => {
  const aiInstance = getAI();
  if (!aiInstance) {
    return { subject: "Exclusive Performance Update", body: "Hello {customerName}, check out our latest upgrades!" };
  }

  try {
    const prompt = `
      You are a high-end marketing expert specifically for automotive performance and tuning shops.
      Generate a ${params.purpose} message.
      Tone: ${params.tone}
      Context: ${params.context}
      
      Requirements:
      - Subject line should be punchy and related to cars/performance.
      - Body should be professional, engaging, and include a clear call to action.
      - Use placeholders like {customerName} or {shopName} where appropriate.
    `;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING }
          },
          required: ["subject", "body"]
        }
      }
    });

    return JSON.parse(response.text || '{"subject": "Special Offer", "body": "Check it out!"}');
  } catch (error) {
    console.error("Marketing AI error:", error);
    return { subject: "Exclusive Performance Update", body: "Hello {customerName}, check out our latest upgrades!" };
  }
};

export const getMarketingAdvice = async (question: string, stats: any): Promise<string> => {
  const aiInstance = getAI();
  if (!aiInstance) {
    return "Ensure consistent communication through reminders and high-quality photography of your builds.";
  }

  try {
    const prompt = `
      As an automotive marketing strategist, answer this: "${question}"
      Context:
      - Shop Stats: Total Customers: ${stats.customerCount}, Avg Invoice: $${stats.avgInvoice}
      Keep your advice actionable, concise, and tailored to the car enthusiast market.
    `;

    const response = await aiInstance.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Focus on social media and repeat customer loyalty.";
  } catch (error) {
    return "Ensure consistent communication through reminders and high-quality photography of your builds.";
  }
};
