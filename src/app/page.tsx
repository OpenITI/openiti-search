import { searchBooks } from "@/lib/search";
import Header from "./_components/header";
import SearchResults from "@/components/search-results";
import BookItem from "@/components/book-item";
import Container from "@/components/ui/container";
import { SearchMode } from "@/types/search-mode";
import { bookSorts } from "@/lib/url";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import GenresFilter from "./_components/book-filters/genre";
import AuthorsFilter from "./_components/book-filters/author";

const getSortString = (sort: (typeof bookSorts)[number]["value"]) => {
  if (sort === "relevance") return undefined;
};

type BooksPageProps = InferPagePropsType<RouteType>;

export const dynamic = "force-dynamic";

async function BooksPage({ searchParams }: BooksPageProps) {
  const { q, sort, page, genres, authors } = searchParams;

  const results = await searchBooks(q, {
    limit: 20,
    page,
    sortBy: getSortString(sort),
    filters: {
      genres,
      authors,
    },
  });

  return (
    <>
      <Header query={q} currentMode={SearchMode.Books} />

      <Container className="mt-10 sm:mt-16">
        <SearchResults
          response={results.results}
          pagination={results.pagination}
          renderResult={(result) => <BookItem result={result} />}
          emptyMessage="No books found"
          sorts={bookSorts as any}
          currentSort={sort}
          filters={
            <>
              <AuthorsFilter
                currentAuthors={authors}
                selectedAuthorsResponse={results.selectedAuthors}
              />
              <GenresFilter currentGenres={genres} />
            </>
          }
        />
      </Container>
    </>
  );
}

export default withParamValidation(BooksPage, Route);
