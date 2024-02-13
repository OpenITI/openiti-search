import SearchInput from "./search-input";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Header({
  query,
  currentPage,
}: {
  query: string;
  currentPage: "authors" | "books";
}) {
  return (
    <>
      <h1 className="text-center text-4xl font-bold text-slate-900">
        Search the{" "}
        <a
          href="https://github.com/openiti/RELEASE"
          target="_blank"
          className="text-amber-700"
        >
          OpenITI Corpus
        </a>
      </h1>

      <Tabs
        value={currentPage}
        className="mt-10 flex w-full flex-col items-center"
      >
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

      <div className="mt-2">
        <SearchInput defaultValue={query} />
      </div>
    </>
  );
}
