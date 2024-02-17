"use client";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import Spinner from "@/components/ui/spinner";
import { getYearFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const DEBOUNCE_DELAY = 300;

export default function YearFilter({
  defaultRange,
  maxYear,
}: {
  defaultRange: [number, number];
  maxYear: number;
}) {
  const [value, setValue] = useState(defaultRange); // [from, to]
  const [tempValue, setTempValue] = useState(value);

  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    setValue(defaultRange);
    setTempValue(defaultRange);
  }, [defaultRange]);

  const handleChange = (newValue: [number, number]) => {
    if (newValue?.[0] > newValue?.[1]) return;

    setValue(newValue);
    const params = getYearFilterUrlParams(newValue[0], newValue[1]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    pos: "from" | "to",
  ) => {
    const newValue = [...value];

    const inputValue = parseInt(e.target.value);
    if (inputValue < 1 || inputValue > maxYear) return;

    newValue[pos === "from" ? 0 : 1] = inputValue;

    setTempValue(newValue as [number, number]);
    handleChange(newValue as [number, number]);
  };

  return (
    <div className="relative mt-5 rounded-md bg-white p-4">
      <h3 className="flex items-center justify-between text-lg">
        <span className="flex items-center">
          Year
          {isPending && <Spinner className="ml-2 h-4 w-4" />}
        </span>

        <span className="ml-2 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs">
          AH
        </span>
      </h3>

      <div className="mt-5 space-y-5">
        <Slider
          value={tempValue}
          onValueChange={setTempValue as any}
          min={1}
          max={maxYear}
          onValueCommit={handleChange}
          minStepsBetweenThumbs={1}
          step={1}
          disabled={isPending}
        />

        <div className="font-inter flex justify-between gap-1">
          <Input
            placeholder="From"
            type="number"
            value={tempValue[0] !== value[0] ? tempValue[0] : value[0]}
            onChange={(e) => handleInputChange(e, "from")}
            disabled={isPending}
            className="max-w-[80px]"
          />

          <Input
            placeholder="To"
            type="number"
            value={tempValue[1] !== value[1] ? tempValue[1] : value[1]}
            onChange={(e) => handleInputChange(e, "to")}
            disabled={isPending}
            className="max-w-[80px]"
          />
        </div>
      </div>
    </div>
  );
}
