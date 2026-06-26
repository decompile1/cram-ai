import { inngest } from "./client";
import { db } from "@/server/db";
import { env } from "@/env";

export const generateCramSetDoc = inngest.createFunction(
  {
    id: "generate-cram-set-job",
    name: "AI Cram Generation Handler",
    retries: 2,
    triggers: { 
      event: "app/cram.requested" 
    },
    throttle: {
      limit: 5,
      period: "1m",
      key: "event.data.studySetId",
    },
  },
  async ({ event, step }: {
    event: { 
      data: { 
        studySetId: string; 
        rawText: string; 
        courseName: string; 
      } 
    }; 
    step: any; 
  }) => {
    const { studySetId, rawText, courseName } = event.data;

    const aiGeneratedData = await step.run("call-llm-api", async () => {

      const backendUrl = env.CRAM_AI_ROUTE;

      const response = await fetch(`${backendUrl}/api/generate-cram-set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course: courseName,
          study_material: rawText,
        }),
      });

      if (!response.ok) {
        throw new Error(`FastAPI backend returned error: ${response.statusText} (${response.status})`);
      }

      // Parse the raw JSON string returned by your Python script
      const rawJsonString = await response.json();
      
      const parsedData = typeof rawJsonString === "string" ? JSON.parse(rawJsonString) : rawJsonString;
      
      return parsedData;
    });

    // Step 2: Save the structured flashcards directly to your studySet model column row
    await step.run("save-to-postgres", async () => {
      await db.studySet.update({
        where: { id: studySetId },
        data: {
          // Saving the parsed flashcards array directly into the Json column field
          cards: aiGeneratedData.flashcards || [],
        },
      });
    });

    return { status: "success", studySetId };
  }
);