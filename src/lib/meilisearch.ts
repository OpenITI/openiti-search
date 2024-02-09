import { env } from "@/env";
import { MeiliSearch } from "meilisearch";

export const client = new MeiliSearch({
  apiKey: env.MEILI_SEARCH_API_KEY,
  host: env.MEILI_SEARCH_URL,
});
