"use client";

import Spinner from "@/components/spinner";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const DEBOUNCE_DELAY = 300;

export default function SearchInput({
  disabled,
  defaultValue,
}: {
  disabled?: boolean;
  defaultValue?: string;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (value !== defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  function handleSearch(term: string) {
    setValue(term);
    const params = new URLSearchParams(window.location.search);

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newTimeout = setTimeout(() => {
      startTransition(() => {
        replace(`${pathname}?${params.toString()}`);
      });
    }, DEBOUNCE_DELAY);

    // @ts-ignore
    timeoutRef.current = newTimeout;
  }

  return (
    <div className="relative w-full">
      <MagnifyingGlassIcon className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2" />
      <input
        className="w-full rounded-full border-2 border-slate-300 bg-white px-4 py-3 pl-10"
        name="query"
        type="text"
        disabled={disabled}
        placeholder="Enter your query..."
        autoComplete="off"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isPending && <Spinner className="absolute right-4 top-3.5 h-6 w-6" />}
    </div>
  );
}
