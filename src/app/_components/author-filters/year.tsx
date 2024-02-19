"use client";

import FilterContainer from "@/components/filter-container";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { gregorianYearToHijriYear, hijriYearToGregorianYear } from "@/lib/date";
import { getYearFilterUrlParams } from "@/lib/url";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useLocalStorage } from "usehooks-ts";

const DEBOUNCE_DELAY = 300;

const yearFormats = [
  {
    value: "AH",
    description: "Year in Hijri calendar",
  },
  {
    value: "AD",
    description: "Year in Gregorian calendar",
  },
] as const;
type YearFormat = (typeof yearFormats)[number]["value"];

const parseYearsInFormat = (
  years: [number, number],
  format: YearFormat,
): [number, number] => {
  return format === "AH"
    ? years
    : (years.map(hijriYearToGregorianYear) as [number, number]);
};

export interface YearFilterProps {
  defaultRange: [number, number];
  maxYear: number;
}

export default function YearFilter({ defaultRange, maxYear }: YearFilterProps) {
  const [format, setFormat] = useLocalStorage<YearFormat>("year-format", "AH");
  const [value, setValue] = useState(() =>
    parseYearsInFormat(defaultRange, format),
  );
  const [tempValue, setTempValue] = useState(value);

  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const defaultRangeInCurrentFormat = parseYearsInFormat(
      defaultRange,
      format,
    );

    setValue(defaultRangeInCurrentFormat);
    setTempValue(defaultRangeInCurrentFormat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRange]);

  const handleChange = (newValue: [number, number]) => {
    if (newValue?.[0] > newValue?.[1]) return;

    setValue(newValue);

    // If the format is AD (Gregorian), we need to convert the year to Hijri
    const newValueInHijri = (
      format === "AH"
        ? newValue
        : newValue.map((y) => gregorianYearToHijriYear(y) + 1)
    ) as [number, number];

    const params = getYearFilterUrlParams(
      newValueInHijri[0],
      newValueInHijri[1],
    );

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

  const from = tempValue[0] !== value[0] ? tempValue[0] : value[0];
  const to = tempValue[1] !== value[1] ? tempValue[1] : value[1];

  const min = format === "AH" ? 1 : hijriYearToGregorianYear(1);
  const max = format === "AH" ? maxYear : hijriYearToGregorianYear(maxYear);

  const handleSliderChange = (newValues: [number, number]) => {
    setTempValue(newValues);
  };

  const handleYearFormatChange = (newFormat: YearFormat) => {
    setFormat(newFormat);

    // convert current state to the new format
    const converter =
      newFormat === "AH" ? gregorianYearToHijriYear : hijriYearToGregorianYear;
    setTempValue(tempValue.map(converter) as [number, number]);
    setValue(value.map(converter) as [number, number]);
  };

  return (
    <FilterContainer
      title="Year"
      isLoading={isPending}
      titleChildren={
        <Select value={format} onValueChange={handleYearFormatChange}>
          <SelectTrigger className="h-auto w-auto gap-2 rounded-full border-none bg-gray-200 px-2.5 py-1 text-xs">
            {format}
          </SelectTrigger>
          <SelectContent className="max-w-[200px]" side="bottom" align="end">
            {yearFormats.map((format) => (
              <SelectItem
                key={format.value}
                value={format.value}
                className="py-2"
              >
                <p>{format.value}</p>
                <p className="font-inter mt-1 text-xs text-gray-400">
                  {format.description}
                </p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="mt-4">
        <Slider
          value={tempValue}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          onValueCommit={handleChange}
          minStepsBetweenThumbs={1}
          step={1}
          disabled={isPending}
        />

        <div className="font-inter mt-4 flex justify-between gap-1">
          <Input
            placeholder="From"
            type="number"
            value={from}
            onChange={(e) => handleInputChange(e, "from")}
            disabled={isPending}
            className="max-w-[80px]"
          />

          <Input
            placeholder="To"
            type="number"
            value={to}
            onChange={(e) => handleInputChange(e, "to")}
            disabled={isPending}
            className="max-w-[80px]"
          />
        </div>
      </div>
    </FilterContainer>
  );
}
