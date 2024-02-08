"use client";

import { search } from "@/lib/search";
import { useSettings } from "@/stores/settings";
import { type BookDocument } from '@/types/book';
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay ?? 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function HomePage() {
  const [results, setResults] = useState<Awaited<
    ReturnType<typeof search>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const { language, setLanguage } = useSettings();

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setResults(null);

      setResults(await search(debouncedQuery));
      setIsLoading(false);
    };

    handleSearch();
  }, [debouncedQuery]);

  return (
    <main className="flex min-h-screen w-full justify-center bg-gradient-to-tr from-slate-300 to-white font-sans">
      <div className="absolute right-5 top-5">
        <button
          className="rounded-md bg-amber-600 px-4 py-2 text-white"
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
        >
          {language === "en" ? "EN" : "AR"}
        </button>
      </div>

      <div className="mt-52 w-full max-w-3xl pb-40">
        <h1 className="text-3xl font-bold text-slate-900">
          Search{" "}
          <a
            href="https://github.com/OpenITI/RELEASE"
            className="text-amber-700"
          >
            OpenITI Corpus
          </a>
        </h1>

        <div className="relative mt-10 w-full">
          <MagnifyingGlassIcon className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            className="w-full rounded-full border-2 border-slate-300 bg-white px-4 py-3 pl-10"
            name="query"
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {/* <button
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-amber-600 p-2 text-white disabled:animate-pulse disabled:cursor-not-allowed disabled:bg-amber-500"
            type="submit"
            disabled={isLoading}
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button> */}
        </div>

        <div className="mt-10 w-full">
          {results === null || isLoading ? (
            <h1 className="text-center">{isLoading ? "Loading..." : ""}</h1>
          ) : (
            <>
              <div className="w-full">
                <h2 className="text-2xl">Authors</h2>

                <div className="mt-2 flex flex-col gap-5">
                  {results.authors.length > 0 ? (
                    results.authors.map((result) => {
                      const document = result._source!;

                      let authorNames =
                        language === "ar"
                          ? document.arabicNames
                          : document.latinNames;
                      if (authorNames.length === 0) {
                        authorNames =
                          document.latinNames.length > 0
                            ? document.latinNames
                            : document.arabicNames;
                      }

                      const firstName = authorNames.sort(
                        (a, b) => a.length - b.length,
                      )[0];
                      const otherNames = authorNames;

                      return (
                        <a
                          key={result._id}
                          className="relative w-full rounded-md bg-white px-4 py-4 pt-4 shadow-md"
                          href={`https://github.com/OpenITI/RELEASE/tree/2385733573ab800b5aea09bc846b1d864f475476/data/${document.id}`}
                        >
                          <h2 className="text-lg text-slate-900">
                            {firstName}
                          </h2>

                          {otherNames.length > 0 && (
                            <p className="mt-2 text-slate-600">
                              {otherNames.join(", ")}
                            </p>
                          )}
                        </a>
                      );
                    })
                  ) : (
                    <p>No authors found</p>
                  )}
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl">Books</h2>

                <div className="mt-2 flex flex-col gap-5">
                  {results.books.length > 0 ? (
                    results.books.map((result) => {
                      const document = result._source!;
                      const highlight = result.highlight;

                      let fieldToUse: keyof BookDocument = language === "ar" ? "arabicNames" : "latinNames";
                      if (document[fieldToUse].length === 0) {
                        fieldToUse = document.latinNames.length > 0 ? "latinNames" : "arabicNames";
                      }

                      const bookNames = (highlight?.[fieldToUse] && highlight?.[(fieldToUse as any)]!.length > 0 ? highlight?.[fieldToUse] : document[fieldToUse])!;

                      const [firstName, ...otherNames] = bookNames.sort(
                        (a, b) => a.length - b.length,
                      ) as [string];
                    

                      const slug = `${document.author}/${document.id}`;

                      return (
                        <a
                          key={result._id}
                          className="elative w-full rounded-md bg-white px-4 py-4 pt-4 shadow-md"
                          href={`https://github.com/OpenITI/RELEASE/tree/2385733573ab800b5aea09bc846b1d864f475476/data/${slug}`}
                        >
                          <h2 className="text-lg text-slate-900 [&>em]:bg-yellow-200" 
                            dangerouslySetInnerHTML={{
                              __html: firstName,
                            }}
                          />

                          {otherNames.length > 0 && (
                            <p className="mt-2 text-slate-600 [&>em]:bg-yellow-200" 
                              dangerouslySetInnerHTML={{
                                __html: otherNames.join(", ")
                              }}
                            />
                          )}
                        </a>
                      );
                    })
                  ) : (
                    <p>No books found</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
