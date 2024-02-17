"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { getAuthorsFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { searchAuthors } from "@/lib/search";
import type { SearchResponse } from "typesense/lib/Typesense/Documents";
import type { AuthorDocument } from "@/types/author";

const DEBOUNCE_DELAY = 300;

interface AuthorsFilterProps {
  currentAuthors: string[];
  selectedAuthorsResponse: SearchResponse<AuthorDocument> | null;
}

export default function AuthorsFilter({
  currentAuthors,
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
  >({});
  const [loading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

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
    });

    setPageToResponse((prev) => ({
      ...(options.reset ? {} : prev),
      [p]: results,
    }));
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAuthors("", 1);
  }, []);

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

    const params = getAuthorsFilterUrlParams(newSelectedAuthors);

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
    const hasMore = allResponses[allResponses.length - 1]?.pagination.hasNext;
    const items = allResponses.flatMap((r) => r.results.hits ?? []);

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
    <div className="relative mt-5 rounded-md bg-white p-4">
      <h3 className="text-lg">
        <span className="flex items-center">
          Authors
          {(isPending || loading) && <Spinner className="ml-2 h-4 w-4" />}
        </span>
      </h3>

      <Input
        placeholder="Search for a genre"
        className="font-inter mt-3"
        value={value}
        onChange={handleInputChange}
        disabled={loading}
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
    </div>
  );
}
