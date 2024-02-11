"use client";

import type { searchBooks } from "@/lib/search";
import { cn } from "@/lib/utils";
import { useState } from "react";

const BookItem = ({
  result,
}: {
  result: NonNullable<
    Awaited<ReturnType<typeof searchBooks>>["results"]["hits"]
  >[number];
}) => {
  const { document, highlight } = result;
  const [open, setOpen] = useState(false);

  const primaryArabicName = highlight.primaryArabicName?.snippet
    ? highlight.primaryArabicName.snippet
    : document.primaryArabicName;
  const primaryLatinName = highlight.primaryLatinName?.snippet
    ? highlight.primaryLatinName.snippet
    : document.primaryLatinName;

  if (!primaryArabicName && !primaryLatinName) {
    return null;
  }

  const authorGithubUrl = `https://github.com/OpenITI/RELEASE/tree/2385733573ab800b5aea09bc846b1d864f475476/data/${document.authorId}`;
  const githubUrl = `${authorGithubUrl}/${document.id}`;

  const tags = document.genreTags
    .map((g) => g.split("@")[1]?.trim())
    .filter((a) => !!a);

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer flex-col gap-2 bg-white p-4",
        !open && "h-[100px] justify-center",
      )}
      onClick={() => setOpen(!open)}
    >
      {open ? (
        <>
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row-reverse sm:gap-0">
            <div className="max-w-lg flex-1 text-right">
              {primaryArabicName && (
                <h2
                  className="text-xl text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: primaryArabicName,
                  }}
                />
              )}
              <p className="text-slate-700">
                {document.otherArabicNames.join(", ")}
              </p>
            </div>

            <div className="max-w-lg flex-1 text-left">
              {primaryLatinName && (
                <h2
                  className="text-xl text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: primaryLatinName,
                  }}
                />
              )}

              <p className="text-slate-700">
                {document.otherLatinNames.join(", ")}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xl font-bold">Author:</p>
            <div className="mt-3 flex flex-col items-start justify-between gap-5 sm:flex-row-reverse sm:gap-0">
              <div className="max-w-lg flex-1 text-right">
                {document.author.primaryArabicName && (
                  <h2
                    className="text-xl text-slate-900"
                    dangerouslySetInnerHTML={{
                      __html: document.author.primaryArabicName,
                    }}
                  />
                )}
                <p className="text-slate-700">
                  {document.author.otherArabicNames.join(", ")}
                </p>
              </div>

              <div className="max-w-lg flex-1 text-left">
                {document.author.primaryLatinName && (
                  <h2
                    className="text-xl text-slate-900"
                    dangerouslySetInnerHTML={{
                      __html: document.author.primaryLatinName,
                    }}
                  />
                )}

                <p className="text-slate-700">
                  {document.author.otherLatinNames.join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xl font-bold">Versions:</p>
            <div className="mt-3 grid grid-cols-1 items-end gap-3 sm:grid-cols-2">
              {document.versionIds.map((version) => {
                const versionUrl = `${githubUrl}/${version}`;

                return (
                  <div key={version}>
                    <a
                      className="block w-fit hover:underline"
                      href={versionUrl}
                      target="_blank"
                    >
                      <p>{version}</p>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            <p className="text-xl font-bold">Tags:</p>
            <div className="mt-3 flex max-w-xl flex-wrap gap-1">
              {tags.length ? (
                tags.map((tag) => {
                  return (
                    <div
                      key={tag}
                      className="rounded-full bg-amber-600 px-3 py-1 text-xs text-white"
                    >
                      <p>{tag}</p>
                    </div>
                  );
                })
              ) : (
                <p>None</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex-[1.5]">
            <a
              href={githubUrl}
              target="_blank"
              className="flex w-fit flex-col items-start hover:underline"
            >
              {primaryArabicName && (
                <h2
                  dir="rtl"
                  className="line-clamp-1 text-ellipsis text-xl text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: primaryArabicName,
                  }}
                />
              )}

              {primaryLatinName && (
                <h2
                  className={cn(
                    "line-clamp-1 text-ellipsis",
                    primaryArabicName
                      ? "mt-2 text-lg text-slate-600"
                      : "text-xl text-slate-900",
                  )}
                  dangerouslySetInnerHTML={{
                    __html: primaryLatinName,
                  }}
                />
              )}
            </a>
          </div>

          <div className="flex flex-1 justify-center">
            <a
              href={authorGithubUrl}
              target="_blank"
              className="flex w-fit flex-col items-center hover:underline"
            >
              {document.author.primaryArabicName && (
                <h2
                  dir="rtl"
                  className="line-clamp-1 text-ellipsis text-xl text-slate-900"
                  dangerouslySetInnerHTML={{
                    __html: document.author.primaryArabicName,
                  }}
                />
              )}

              {document.author.primaryLatinName && (
                <h2
                  className={cn(
                    "line-clamp-1 text-ellipsis",
                    document.author.primaryArabicName
                      ? "mt-2 text-lg text-slate-600"
                      : "text-xl text-slate-900",
                  )}
                  dangerouslySetInnerHTML={{
                    __html: document.author.primaryLatinName,
                  }}
                />
              )}
            </a>
          </div>

          <div className="flex-1 text-center">
            {document.versionIds.length} Versions
          </div>

          {tags.length > 0 ? (
            <div className="flex-1 text-center">
              {tags.slice(0, 3).join(", ")}
              {tags.length > 3 && <p>+{tags.length - 3} more</p>}
            </div>
          ) : (
            <div className="flex-1 text-center">None</div>
          )}

          {/* <div className="flex-[0.5] text-center">{document.year} AH</div> */}
        </div>
      )}
    </div>
  );
};

export default BookItem;
