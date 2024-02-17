"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import { getGeoFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import geographies from "../../../../data/distinct-tags.json";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";

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

  const matchedGeographies = useMemo(() => {
    const q = value.trim();
    if (!q) {
      const hasMore = geographies.length > size;
      return {
        items: geographies.slice(0, size),
        hasMore,
      };
    }

    const matches = index.search(q, { limit: size }).map((r) => r.item.name);
    return {
      items: matches,
      hasMore: matches.length === size,
    };
  }, [value, index, size]);

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

  return (
    <div className="relative mt-5 rounded-md bg-white p-4">
      <h3 className="text-lg">
        <span className="flex items-center">
          Geo
          {isPending && <Spinner className="ml-2 h-4 w-4" />}
        </span>
      </h3>

      <Input
        placeholder="Search for a geography"
        className="font-inter mt-3"
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
    </div>
  );
}
