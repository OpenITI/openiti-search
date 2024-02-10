"use server";

import { client } from "./typesense";
import type { AuthorDocument } from "@/types/author";
import type { BookDocument } from "@/types/book";

const AUTHORS_INDEX = "authors";
const TITLES_INDEX = "books";

export const search = async (q: string) => {
  const [authors, books] = await Promise.all([
    client.collections<AuthorDocument>(AUTHORS_INDEX).documents().search({
      q,
      query_by:
        "primaryArabicName, primaryLatinName, otherArabicNames, otherLatinNames",
      query_by_weights:
        "primaryArabicName:2, primaryLatinName:2, otherArabicNames:1, otherLatinNames:1",
      limit: 5,
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
