import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ELASTIC_CLOUD_ID: z.string().min(1),
    ELASTIC_CLOUD_USERNAME: z.string().min(1),
    ELASTIC_CLOUD_PASSWORD: z.string().min(1),
    TYPESENSE_API_KEY: z.string().min(1),
    TYPESENSE_URL: z.string().min(1),
    MEILI_SEARCH_API_KEY: z.string().min(1),
    MEILI_SEARCH_URL: z.string().min(1),
  },
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ELASTIC_CLOUD_ID: process.env.ELASTIC_CLOUD_ID,
    ELASTIC_CLOUD_USERNAME: process.env.ELASTIC_CLOUD_USERNAME,
    ELASTIC_CLOUD_PASSWORD: process.env.ELASTIC_CLOUD_PASSWORD,
    TYPESENSE_API_KEY: process.env.TYPESENSE_API_KEY,
    TYPESENSE_URL: process.env.TYPESENSE_URL,
    MEILI_SEARCH_API_KEY: process.env.MEILI_SEARCH_API_KEY,
    MEILI_SEARCH_URL: process.env.MEILI_SEARCH_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
