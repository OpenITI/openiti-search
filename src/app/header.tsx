import SearchInput from "./search-input";
import Container from "@/components/ui/container";
import SearchMode from "./_components/search-mode";

export default function Header({
  query,
  currentPage,
}: {
  query: string;
  currentPage: "authors" | "books";
}) {
  return (
    <div className="bg-blue-700 py-12 text-white">
      <Container>
        <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-center sm:gap-0">
          <h1 className="text-4xl font-bold text-white">
            Search the{" "}
            <a
              href="https://github.com/openiti/RELEASE"
              target="_blank"
              className="text-blue-100 underline"
            >
              OpenITI Corpus
            </a>
          </h1>

          <div>
            <SearchMode currentPage={currentPage} query={query} />
          </div>
        </div>

        <div className="mt-10 sm:mt-20">
          <SearchInput defaultValue={query} />
        </div>
      </Container>
    </div>
  );
}
