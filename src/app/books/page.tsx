import { searchBooks } from "@/lib/search";
import Header from "../header";
import SearchResults from "@/components/search-results";
import BookItem from "@/components/book-item";

interface HomePageProps {
  searchParams: { q: string; page: string };
}

export default async function BooksPage({ searchParams }: HomePageProps) {
  const q = searchParams.q ?? "";
  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const results = await searchBooks(q, { limit: 20, page });

  return (
    <main className="flex min-h-screen w-full justify-center">
      <div className="mt-20 w-full max-w-6xl pb-40">
        <Header query={q} currentPage="books" />

        <div className="mt-10 w-full">
          <SearchResults
            response={results.results}
            pagination={results.pagination}
            renderResult={(result) => <BookItem result={result} />}
            columns={[
              {
                title: "Title",
                className: "flex-[1.5]",
              },
              {
                title: "Author",
                className: "text-center",
              },
              {
                title: "Versions",
                className: "text-center",
              },
              {
                title: "Tags",
                className: "text-center",
              },
            ]}
            emptyMessage="No books found"
          />
        </div>
      </div>
    </main>
  );
}
