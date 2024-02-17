import { bookSorts } from "@/lib/url";
import { type DynamicRoute } from "next-typesafe-url";
import { z } from "zod";

const sorts = bookSorts.map((s) => s.value);

export const Route = {
  searchParams: z.object({
    q: z.string().default(""),
    page: z.number().min(1).catch(1),
    sort: z
      .enum(sorts as any)
      .default("relevance")
      .catch("relevance"),
    genres: z
      .string()
      .transform((v) => v.split(","))
      .catch([] as string[]),
    authors: z
      .string()
      .transform((v) => v.split(","))
      .catch([] as string[]),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
