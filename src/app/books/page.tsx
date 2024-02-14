import { searchBooks } from "@/lib/search";
import Header from "../_components/header";
import SearchResults from "@/components/search-results";
import BookItem from "@/components/book-item";
import Container from "@/components/ui/container";
import { SearchMode } from "@/types/search-mode";

interface HomePageProps {
  searchParams: { q?: string; page?: string; sort?: string };
}

const sorts = [{ label: "Relevance", value: "relevance" }] as const;

const getSortString = (sort: (typeof sorts)[number]["value"]) => {
  if (sort === "relevance") return undefined;
};

export default async function BooksPage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const currentSort = searchParams.sort ?? "relevance";
  const sort = sorts.find((s) => s.value === currentSort)?.value ?? "relevance";

  const results = await searchBooks(q, {
    limit: 20,
    page,
    sortBy: getSortString(sort),
  });

  return (
    <>
      <Header query={q} currentMode={SearchMode.Books} />

      <Container className="mt-16">
        <SearchResults
          response={results.results}
          pagination={results.pagination}
          renderResult={(result) => <BookItem result={result} />}
          emptyMessage="No books found"
          sorts={sorts as any}
          currentSort={sort}
        />
      </Container>
    </>
  );
}
