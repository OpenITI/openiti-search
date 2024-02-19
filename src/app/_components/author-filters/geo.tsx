"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getGeoFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import geographies from "../../../../data/distinct-tags.json";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import FilterContainer from "@/components/filter-container";

const DEBOUNCE_DELAY = 300;

interface GeographiesFilterProps {
  currentGeographies: string[];
}

export default function GeographiesFilter({
  currentGeographies,
}: GeographiesFilterProps) {
  const [selectedGeographies, setSelectedGeographies] =
    useState<string[]>(currentGeographies);

  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const pathname = usePathname();
  const { replace } = useRouter();

  const index = useMemo(() => {
    return new Fuse(
      geographies.map((g) => ({ name: g })),
      {
        keys: ["name"],
        threshold: 0.3,
        includeScore: true,
      },
    );
  }, []);

  const [value, setValue] = useState("");
  const [size, setSize] = useState(10);

  useEffect(() => {
    setSelectedGeographies(currentGeographies);
  }, [currentGeographies]);

  const handleChange = (geo: string) => {
    let newSelectedGeographies = [...selectedGeographies];
    if (newSelectedGeographies.includes(geo)) {
      newSelectedGeographies = newSelectedGeographies.filter((g) => g !== geo);
    } else {
      newSelectedGeographies.push(geo);
    }
    setSelectedGeographies(newSelectedGeographies);

    const params = getGeoFilterUrlParams(newSelectedGeographies);

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

  const matchedGeographies = useMemo(() => {
    const q = value.trim();
    const selectedGeographiesSet = new Set(selectedGeographies);

    if (!q) {
      const items = selectedGeographies.concat(
        geographies
          .slice(0, size)
          .filter((g) => !selectedGeographiesSet.has(g)),
      );

      return {
        items,
        hasMore: geographies.length > size,
      };
    }

    const matches = index.search(q, { limit: size }).map((r) => r.item.name);
    const items = selectedGeographies.concat(
      matches.filter((g) => !selectedGeographiesSet.has(g)),
    );

    return {
      items,
      hasMore: matches.length === size,
    };
  }, [value, index, size, selectedGeographies]);

  return (
    <FilterContainer
      title="Geo"
      isLoading={isPending}
      clearFilterHref={
        selectedGeographies.length > 0
          ? {
              pathname,
              query: getGeoFilterUrlParams([]).toString(),
            }
          : undefined
      }
    >
      <Input
        placeholder="Search for a geography"
        className="font-inter"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* make font weight normal */}
      <div className="font-inter mt-3 max-h-[300px] w-full space-y-3 overflow-y-scroll sm:max-h-none sm:overflow-y-auto">
        {matchedGeographies.items.map((geo) => {
          return (
            <div key={geo} className="flex items-center gap-2">
              <Checkbox
                id={geo}
                checked={selectedGeographies.includes(geo)}
                onCheckedChange={() => handleChange(geo)}
                className="h-4 w-4"
              />

              <label
                htmlFor={geo}
                className="line-clamp-1 min-w-0 max-w-[70%] break-words text-sm"
                title={geo}
              >
                {geo}
              </label>
            </div>
          );
        })}

        {matchedGeographies.hasMore && (
          <Button
            variant="link"
            onClick={() => {
              setSize((prev) => prev + 10);
            }}
          >
            Show more
          </Button>
        )}
      </div>
    </FilterContainer>
  );
}
