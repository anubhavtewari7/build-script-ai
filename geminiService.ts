
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { DiagnosticResult, Vehicle, Modification } from "../types";

// Robustly check for the API key in both process.env and vite's import.meta.env
export const getGeminiClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                 (import.meta as any).env?.VITE_API_KEY || 
                 (window as any).process?.env?.API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing from environment variables.");
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

export async function analyzeDiagnosticCode(
  vehicle: Vehicle, 
  code: string
): Promise<DiagnosticResult> {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the OBD-II diagnostic code "${code}" for a ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${vehicle.mileage} miles. 
    Provide technical details, repair estimations, and safety advice. 
    If the severity is Low or Medium, also provide a DIY Repair Guide including feasibility, a list of specific tools needed, basic steps, and estimated savings if they do it themselves.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { 
            type: Type.STRING, 
            enum: ['low', 'medium', 'high', 'critical'] 
          },
          likelyCauses: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          estimatedRepairCost: { type: Type.STRING },
          partsNeeded: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING } 
          },
          canDrive: { type: Type.BOOLEAN },
          diyInstructions: {
            type: Type.OBJECT,
            properties: {
              feasibility: { type: Type.STRING },
              tools: { type: Type.ARRAY, items: { type: Type.STRING } },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              savings: { type: Type.STRING }
            }
          }
        },
        required: ["code", "title", "description", "severity", "likelyCauses", "estimatedRepairCost", "partsNeeded", "canDrive"]
      }
    }
  });

  try {
    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse AI response");
  }
}

export async function getModifications(vehicle: Vehicle): Promise<Modification[]> {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Suggest 5 professional-grade modifications or tunings for a ${vehicle.year} ${vehicle.make} ${vehicle.model}. 
    Categories should include things like "Performance Tune", "Suspension", "Air Intake", etc.
    For each mod, provide a description, estimated cost, difficulty, installation steps, and performance impact metrics.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            costEstimate: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['easy', 'moderate', 'advanced'] },
            performanceImpact: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  stock: { type: Type.NUMBER },
                  modded: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                },
                required: ["label", "stock", "modded", "unit"]
              }
            },
            installationSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            requiredTools: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "name", "category", "description", "costEstimate", "difficulty", "performanceImpact", "installationSteps", "requiredTools"]
        }
      }
    }
  });

  try {
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
}

export async function analyzeVehicleImage(
  vehicle: Vehicle, 
  base64Image: string,
  prompt: string = "Identify any warning lights or visible damage in this image."
): Promise<string> {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: `Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}. ${prompt}` }
      ]
    }
  });

  return response.text || "I couldn't analyze the image.";
}

export async function getNearbyAutomotiveServices(
  lat: number,
  lng: number,
  type: 'repair' | 'towing'
): Promise<{ text: string; links: any[] }> {
  const ai = getGeminiClient();
  const query = type === 'repair' ? "Best automotive repair nearby" : "Closest towing services";

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      }
    },
  });

  return {
    text: response.text || "No services found.",
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}
