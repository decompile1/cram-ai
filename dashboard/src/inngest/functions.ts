import { inngest } from "./client";
import { db } from "@/server/db";
import { env } from "@/env";

export const generateCramSetDoc = inngest.createFunction(
  {
    id: "generate-cram-set-job",
    name: "AI Cram Generation Handler",
    retries: 2,
    triggers: {
      event: "app/cram.requested",
    },
    throttle: {
      limit: 5,
      period: "1m",
      key: "event.data.studySetId",
    },
  },
  async ({ event, step }) => {
    const { studySetId, rawText, studyGoal, outputType, difficulty } =
      event.data;

    const aiGeneratedData = await step.run("call-llm-api", async () => {
      const backendUrl = env.CRAM_AI_ROUTE;

      const response = await fetch(
        `${backendUrl}/api/generate-cram-set`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studyGoal,
            outputType,
            difficulty,
            study_material: rawText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `FastAPI backend returned error: ${response.statusText} (${response.status})`
        );
      }

      const raw = await response.json();
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    });

    await step.run("save-to-postgres", async () => {
      await db.studySet.update({
        where: { id: studySetId },
        data: {
          cards: aiGeneratedData.flashcards ?? [],
        },
      });
    });

    return { status: "success", studySetId };
  }
);