"use server";

import { AuthorDocument } from "@/types/author";
import { client } from "./typesense";
import { BookDocument } from "@/types/book";

const AUTHORS_INDEX = "authors";
const TITLES_INDEX = "books";

export const search = async (q: string) => {
  const [authors, books] = await Promise.all([
    client.collections<AuthorDocument>(AUTHORS_INDEX).documents().search({
      q,
      query_by: "arabicNames,latinNames",
      limit: 5,
      // prefix: true,
    }),
    client
      .collections<
        Omit<BookDocument, "author"> & {
          authorId: string;
        }
      >(TITLES_INDEX)
      .documents()
      .search({
        q,
        query_by: "arabicNames,latinNames",
        limit: 20,
        // prefix: true,
      }),
  ]);

  return {
    authors,
    books,
  };
};
