import { env } from "@/env";
import * as Typesense from "typesense";

export const client = new Typesense.Client({
  nodes: [
    {
      url: env.TYPESENSE_URL,
    },
  ],
  apiKey: env.TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 5,
});
