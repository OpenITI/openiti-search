import SearchInput from "./search-input";
import Container from "@/components/ui/container";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchMode } from "@/types/search-mode";
import Link from "next/link";

const modes = [
  {
    label: "Authors",
    value: SearchMode.Authors,
  },
  {
    label: "Books",
    value: SearchMode.Books,
  },
];

const makeModeHref = (mode: SearchMode, query?: string) => ({
  pathname: mode === SearchMode.Authors ? "/" : "/books",
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
    <div className="bg-blue-700 pb-12 pt-16 text-white">
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
