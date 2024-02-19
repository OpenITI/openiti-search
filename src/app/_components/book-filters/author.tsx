"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getAuthorsFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { searchAuthors } from "@/lib/search";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";
import type { AuthorDocument } from "@/types/author";
import FilterContainer from "@/components/filter-container";

const DEBOUNCE_DELAY = 300;

interface AuthorsFilterProps {
  currentAuthors: string[];
  initialAuthorsResponse: Awaited<ReturnType<typeof searchAuthors>>;
  selectedAuthorsResponse: SearchResponse<AuthorDocument> | null;
}

export default function AuthorsFilter({
  currentAuthors,
  initialAuthorsResponse,
  selectedAuthorsResponse,
}: AuthorsFilterProps) {
  const [selectedAuthors, setSelectedAuthors] =
    useState<string[]>(currentAuthors);

  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const pathname = usePathname();
  const { replace } = useRouter();

  const [value, setValue] = useState("");
  const [pageToResponse, setPageToResponse] = useState<
    Record<number, Awaited<ReturnType<typeof searchAuthors>>>
  >({
    1: initialAuthorsResponse,
  });
  const [loading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();

  useEffect(() => {
    setSelectedAuthors(currentAuthors);
  }, [currentAuthors]);

  const fetchAuthors = async (
    q: string,
    p: number,
    options: { reset?: boolean } = {},
  ) => {
    setIsLoading(true);

    const results = await searchAuthors(q, {
      page: p,
      limit: 10,
      sortBy: "booksCount:desc,_text_match:desc",
    });

    setPageToResponse((prev) => ({
      ...(options.reset ? {} : prev),
      [p]: results,
    }));
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    setPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const newTimeout = setTimeout(() => {
      fetchAuthors(newValue, 1, { reset: true });
    }, DEBOUNCE_DELAY);

    // @ts-ignore
    searchTimeoutRef.current = newTimeout;
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
    fetchAuthors(value, page + 1);
  };

  const handleChange = (authorId: string) => {
    let newSelectedAuthors = [...selectedAuthors];
    if (newSelectedAuthors.includes(authorId)) {
      newSelectedAuthors = newSelectedAuthors.filter((g) => g !== authorId);
    } else {
      newSelectedAuthors.push(authorId);
    }
    setSelectedAuthors(newSelectedAuthors);

    const params = getAuthorsFilterUrlParams(newSelectedAuthors, searchParams);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newTimeout = setTimeout(() => {
      startTransition(() => {
        replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, DEBOUNCE_DELAY);

    // @ts-ignore
    timeoutRef.current = newTimeout;
  };

  const data = useMemo(() => {
    const allResponses = Object.values(pageToResponse);
    const hasMore = allResponses[allResponses.length - 1]?.pagination?.hasNext;
    const items = allResponses.flatMap((r) => r?.results?.hits ?? []);

    if (!selectedAuthorsResponse) {
      return {
        items,
        hasMore,
      };
    }

    const selectedHits = selectedAuthorsResponse.hits ?? [];
    const selectedIds = new Set(selectedHits.map((i) => i.document.id));

    return {
      items: selectedHits.concat(
        items.filter((item) => !selectedIds.has(item.document.id)),
      ),
      hasMore,
    };
  }, [pageToResponse, selectedAuthorsResponse]);

  return (
    <FilterContainer
      title="Authors"
      isLoading={isPending || loading}
      clearFilterHref={
        selectedAuthors.length > 0
          ? {
              pathname,
              query: getAuthorsFilterUrlParams([], searchParams).toString(),
            }
          : undefined
      }
    >
      <Input
        placeholder="Search for an author"
        className="font-inter"
        value={value}
        onChange={handleInputChange}
      />

      <div className="font-inter mt-3 max-h-[300px] w-full space-y-3 overflow-y-scroll sm:max-h-none sm:overflow-y-auto">
        {data.items.map((item) => {
          const author = item.document;
          const authorId = author.id;

          return (
            <div key={authorId} className="flex items-center gap-2">
              <Checkbox
                id={authorId}
                checked={selectedAuthors.includes(authorId)}
                onCheckedChange={() => handleChange(authorId)}
                className="h-4 w-4"
              />

              <label
                htmlFor={authorId}
                className="line-clamp-1 min-w-0 max-w-[70%] break-words text-sm"
                title={author.primaryLatinName ?? author.primaryArabicName}
              >
                {author.primaryLatinName ?? author.primaryArabicName}
              </label>
            </div>
          );
        })}

        {data.hasMore && (
          <Button onClick={handleLoadMore} variant="link">
            Show more
          </Button>
        )}
      </div>
    </FilterContainer>
  );
}
