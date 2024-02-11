import SearchInput from "./search-input";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authorExamples = [
  "Ibn Taymiyyah",
  "Ibn Hazm",
  "Ibn Hanbal",
  "Ibn al-Jawzi",
];

const bookExamples = ["Sahih al-Bukhari"];

export default function Header({
  query,
  currentPage,
}: {
  query: string;
  currentPage: "authors" | "books";
}) {
  return (
    <>
      <h1 className="text-center text-3xl font-bold text-slate-900">
        Search the{" "}
        <a
          href="https://github.com/openiti/RELEASE"
          target="_blank"
          className="text-amber-600"
        >
          OpenITI Corpus
        </a>
      </h1>

      <Tabs
        value={currentPage}
        className="mt-5 flex w-full flex-col items-center"
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

      {!query && (
        <div className="mt-10 flex items-center justify-center gap-2">
          Try searching for:
          {(currentPage === "authors" ? authorExamples : bookExamples).map(
            (example) => (
              <Link
                key={example}
                href={{
                  pathname: currentPage === "authors" ? "/" : "/books",
                  query: { q: example },
                }}
                className="rounded-full bg-amber-700 px-2 py-1 text-sm font-thin text-white"
              >
                {example}
              </Link>
            ),
          )}
        </div>
      )}
    </>
  );
}
