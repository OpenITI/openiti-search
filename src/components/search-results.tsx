import React from "react";
import Paginator from "@/components/ui/pagination";
import type { Pagination } from "@/types/pagination";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";
import { cn } from "@/lib/utils";
import SearchSort from "./search-sort";

interface SearchResultsProps<T extends object & { id: string }> {
  response: SearchResponse<T>;
  renderResult: (
    result: NonNullable<SearchResponse<T>["hits"]>[number],
  ) => JSX.Element;
  pagination?: Pagination;
  emptyMessage?: string;
  columns: {
    title: string;
    className?: string;
  }[];
  sorts: {
    label: string;
    value: string;
  }[];
  currentSort: string;
}

export default function SearchResults<T extends object & { id: string }>({
  response,
  pagination,
  renderResult,
  emptyMessage = "No matches found",
  sorts,
  currentSort,
}: SearchResultsProps<T>) {
  const hasResults = response.hits?.length ?? 0 > 0;

  return (
    <div>
      {hasResults ? (
        <div className="relative flex w-full flex-col gap-5 font-serif">
          <div className="flex items-center justify-between font-sans">
            <div>
              <p>
                {response.found} results in {response.search_time_ms}ms
              </p>
            </div>

            <div>
              <SearchSort sorts={sorts} currentSort={currentSort} />
            </div>
          </div>
          {/* <div className="flex items-center justify-between bg-amber-800 p-4 font-sans text-white">
            {columns.map((column) => (
              <div
                className={cn("flex-1", column.className)}
                key={column.title}
              >
                {column.title}
              </div>
            ))}
          </div> */}

          {response.hits!.map((result) => (
            <React.Fragment key={result.document.id}>
              {renderResult(result)}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <p>{emptyMessage}</p>
      )}

      {pagination && (
        <div className="mt-10">
          <Paginator
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
          />
        </div>
      )}
    </div>
  );
}
