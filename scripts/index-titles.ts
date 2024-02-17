import { client } from "@/lib/typesense";
import { chunk } from "./utils";
import { getAuthorsData, getBooksData } from "./fetchers";
import fs from "fs/promises";

const INDEX_SHORT_NAME = "books";
const INDEX_NAME = `${INDEX_SHORT_NAME}_${Date.now()}`;

console.log("Fetching books data...");
const books = await getBooksData();
const authorIdToAuthor = (await getAuthorsData()).reduce(
  (acc, author) => {
    // @ts-ignore
    delete author.geographies;

    // @ts-ignore
    acc[author.id] = author;

    return acc;
  },
  {} as Record<string, Awaited<ReturnType<typeof getAuthorsData>>>,
);

console.log("Creating books index...");

let hasCollectionAliases = true;
try {
  await client.aliases(INDEX_SHORT_NAME).retrieve();
} catch (e) {
  hasCollectionAliases = false;
}

if (!hasCollectionAliases) {
  try {
    await client.collections(INDEX_SHORT_NAME).delete();
  } catch (e) {}
}

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
      name: "_nameVariations",
      type: "string[]",
    },
    {
      name: "author",
      type: "object",
      optional: true,
    },
    {
      name: "versionIds",
      type: "string[]",
    },
    {
      name: "genreTags",
      type: "string[]",
      facet: true,
    },
  ],
});

const batches = chunk(books, 200) as (typeof books)[];

let i = 1;
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);
  const responses = await client
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

  if (responses.some((r) => r.success === false)) {
    throw new Error("Failed to index some books on this batch");
  }
  i++;
}

console.log(`Indexed ${books.length} books`);

try {
  const collection = await client.aliases(INDEX_SHORT_NAME).retrieve();

  console.log("Deleting old alias...");
  await client.collections(collection.collection_name).delete();
} catch (e) {}

console.log("Linking new collection to alias...");
await client
  .aliases()
  .upsert(INDEX_SHORT_NAME, { collection_name: INDEX_NAME });

// save distinct genres to file
const tags = [
  ...books.reduce((acc, book) => {
    book.genreTags.forEach((tag) => {
      if (!acc.has(tag)) acc.add(tag);
    });
    return acc;
  }, new Set<string>()),
];

await fs.writeFile(
  "data/distinct-genres.json",
  JSON.stringify(tags, null, 2),
  "utf-8",
);
