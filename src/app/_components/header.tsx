import SearchInput from "./search-input";
import Container from "@/components/ui/container";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchMode } from "@/types/search-mode";
import Image from "next/image";
import Link from "next/link";

const modes = [
  {
    label: "Books",
    value: SearchMode.Books,
  },
  {
    label: "Authors",
    value: SearchMode.Authors,
  },
];

const makeModeHref = (mode: SearchMode, query?: string) => ({
  pathname: mode === SearchMode.Authors ? "/authors" : "/",
  ...(query ? { query: { q: query } } : {}),
});

export default function Header({
  query,
  currentMode,
}: {
  query: string;
  currentMode: SearchMode;
}) {
  return (
    <div className="relative isolate bg-blue-600 bg-gradient-to-b pb-12 pt-12 text-white sm:pt-16">
      <Image
        fill
        className="absolute left-0 top-0 -z-[1] h-full w-full object-cover opacity-30"
        src="/images/bg.jpg"
        alt="Background image"
      />

      <Container>
        <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="text-4xl font-bold">Search the OpenITI Corpus</h1>

          <div>
            <Tabs value={currentMode} className="w-full">
              <TabsList>
                {modes.map((mode) => (
                  <TabsTrigger asChild value={mode.value} key={mode.value}>
                    <Link href={makeModeHref(mode.value, query)}>
                      {mode.label}
                    </Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="mt-10 sm:mt-20">
          <SearchInput defaultValue={query} />
        </div>
      </Container>
    </div>
  );
}
