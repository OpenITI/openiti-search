import { client } from "@/lib/typesense";
import { chunk } from "./utils";
import { getAuthorsData, getBooksData } from "./fetchers";

const INDEX_NAME = "books";

console.log("Fetching books data...");
const books = await getBooksData();
const authorIdToAuthor = (await getAuthorsData()).reduce(
  (acc, author) => {
    // @ts-ignore
    acc[author.id] = author;

    return acc;
  },
  {} as Record<string, Awaited<ReturnType<typeof getAuthorsData>>>,
);

try {
  console.log("Deleting books index...");
  // delete the index if it already exists
  await client.collections(INDEX_NAME).delete();
} catch (e) {}

console.log("Creating books index...");
await client.collections().create({
  name: INDEX_NAME,
  enable_nested_fields: true,
  fields: [
    {
      name: "id",
      type: "string",
    },
    {
      name: "authorId",
      type: "string",
      facet: true,
    },
    {
      name: "primaryArabicName",
      type: "string",
      optional: true,
    },
    {
      name: "otherArabicNames",
      type: "string[]",
    },
    {
      name: "primaryLatinName",
      type: "string",
      optional: true,
    },
    {
      name: "otherLatinNames",
      type: "string[]",
    },
    {
      name: "author",
      type: "object",
      optional: true,
      index: false, // don't index the author object
    },
    {
      name: 'versionIds',
      type: 'string[]', 
    },
    {
      name: 'genreTags',
      type: 'string[]', 
    },
  ],
});

const batches = chunk(books, 100) as (typeof books)[];

let i = 1;
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);
  await client
    .collections(INDEX_NAME)
    .documents()
    .import(
      batch.map((book) => {
        return {
          ...book,
          author: book.authorId
            ? authorIdToAuthor[book.authorId] ?? null
            : null,
          versionIds: book.versionIds,
          genreTags: book.genreTags,
        };
      }),
    );
  i++;
}

console.log(`Indexed ${books.length} books`);
