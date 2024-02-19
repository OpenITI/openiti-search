"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getGenresFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import genres from "../../../../data/distinct-genres.json";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import FilterContainer from "@/components/filter-container";

const DEBOUNCE_DELAY = 300;

interface GenresFilterProps {
  currentGenres: string[];
}

export default function GenresFilter({ currentGenres }: GenresFilterProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentGenres);

  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const pathname = usePathname();
  const { replace } = useRouter();
  const [size, setSize] = useState(10);

  const index = useMemo(() => {
    return new Fuse(
      genres.map((g) => ({ name: g })),
      {
        keys: ["name"],
        threshold: 0.3,
      },
    );
  }, []);

  const [value, setValue] = useState("");

  useEffect(() => {
    setSelectedGenres(currentGenres);
  }, [currentGenres]);

  const handleChange = (genre: string) => {
    let newSelectedGenres = [...selectedGenres];
    if (newSelectedGenres.includes(genre)) {
      newSelectedGenres = newSelectedGenres.filter((g) => g !== genre);
    } else {
      newSelectedGenres.push(genre);
    }
    setSelectedGenres(newSelectedGenres);

    const params = getGenresFilterUrlParams(newSelectedGenres);

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

  const matchedGenres = useMemo(() => {
    const q = value.trim();
    const selectedGenresSet = new Set(selectedGenres);

    if (!q) {
      const items = selectedGenres.concat(
        genres.slice(0, size).filter((g) => !selectedGenresSet.has(g)),
      );

      return {
        items,
        hasMore: genres.length > size,
      };
    }

    const matches = index.search(q, { limit: size }).map((r) => r.item.name);
    const items = selectedGenres.concat(
      matches.filter((g) => !selectedGenresSet.has(g)),
    );

    return {
      items,
      hasMore: matches.length === size,
    };
  }, [value, index, size, selectedGenres]);

  return (
    <FilterContainer
      title="Genres"
      isLoading={isPending}
      clearFilterHref={
        selectedGenres.length > 0
          ? {
              pathname,
              query: getGenresFilterUrlParams([]).toString(),
            }
          : undefined
      }
    >
      <Input
        placeholder="Search for a genre"
        className="font-inter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className="font-inter mt-3 max-h-[300px] w-full space-y-3 overflow-y-scroll sm:max-h-none sm:overflow-y-auto">
        {matchedGenres.items.map((genre) => {
          return (
            <div key={genre} className="flex items-center gap-2">
              <Checkbox
                id={genre}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => handleChange(genre)}
                className="h-4 w-4"
              />

              <label
                htmlFor={genre}
                className="line-clamp-1 min-w-0 max-w-[70%] break-words text-sm"
                title={genre}
              >
                {genre}
              </label>
            </div>
          );
        })}

        {matchedGenres.hasMore && (
          <Button onClick={() => setSize((s) => s + 10)} variant="link">
            Show more
          </Button>
        )}
      </div>
    </FilterContainer>
  );
}
