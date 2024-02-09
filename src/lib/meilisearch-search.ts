"use server";

import type { AuthorDocument } from "@/types/author";
import { client } from "./meilisearch";
import type { BookDocument } from "@/types/book";

const AUTHORS_INDEX = "authors";
const TITLES_INDEX = "books";

export const search = async (q: string) => {
  const [authors, books] = await Promise.all([
    client.index<AuthorDocument>(AUTHORS_INDEX).search(q, {
      limit: 5,
      attributesToSearchOn: ["arabicNames", "latinNames"],
    }),
    client
      .index<
        Omit<BookDocument, "author"> & {
          authorId: string;
        }
      >(TITLES_INDEX)
      .search(q, {
        attributesToSearchOn: ["arabicNames", "latinNames"],
        limit: 20,
        // prefix: true,
      }),
  ]);

  return {
    authors,
    books,
  };
};
