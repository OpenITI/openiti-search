import { gregorianYearToHijriYear } from "@/lib/date";
import { authorSorts } from "@/lib/url";
import { type DynamicRoute } from "next-typesafe-url";
import { z } from "zod";

const sorts = authorSorts.map((s) => s.value);
const defaultYear = [1, gregorianYearToHijriYear(new Date().getFullYear())] as [
  number,
  number,
];

export const Route = {
  searchParams: z.object({
    q: z.string().default(""),
    page: z.number().min(1).catch(1),
    sort: z
      .enum(sorts as any)
      .default("relevance")
      .catch("relevance"),
    year: z
      .string()
      .transform((v) => {
        const [from, to] = v.split("-");
        if (from === undefined || to === undefined) return defaultYear;

        const fromNum = parseInt(from);
        const toNum = parseInt(to);

        if (isNaN(fromNum) || isNaN(toNum)) return defaultYear;

        if (fromNum > toNum) return defaultYear;

        if (fromNum < 1 || toNum < 1) return defaultYear;

        return [fromNum, toNum] as [number, number];
      })
      .catch(defaultYear),
    geo: z
      .string()
      .transform((v) => v.split(",").filter((a) => a.trim().length > 0))
      .catch([] as string[]),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
