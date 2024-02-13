import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const modes = [
  { label: "Authors", value: "authors", path: "/" },
  { label: "Books", value: "books", path: "/books" },
] as const;

type Mode = (typeof modes)[number]["value"];

export default function SearchMode({
  currentPage,
  query,
}: {
  currentPage: Mode;
  query?: string;
}) {
  return (
    <Tabs value={currentPage} className="w-full">
      <TabsList>
        <TabsTrigger asChild value="authors">
          <Link
            href={{
              pathname: "/",
              ...(query ? { query: { q: query } } : {}),
            }}
          >
            Authors
          </Link>
        </TabsTrigger>

        <TabsTrigger asChild value="books">
          <Link
            href={{
              pathname: "/books",
              ...(query ? { query: { q: query } } : {}),
            }}
          >
            Books
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
