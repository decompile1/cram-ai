import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "cramai",
  eventKey: process.env.INNGEST_EVENT_KEY,
});