import { env } from "@/env";

import { Client } from "@elastic/elasticsearch";

export const client = new Client({
  cloud: { id: env.ELASTIC_CLOUD_ID },
  auth: {
    username: env.ELASTIC_CLOUD_USERNAME,
    password: env.ELASTIC_CLOUD_PASSWORD,
  },
});
