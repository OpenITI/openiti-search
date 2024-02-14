import { client } from "@/lib/typesense";
import { chunk } from "./utils";
import { getAuthorsData, getBooksData } from "./fetchers";
import nameAliases from "./name-aliases.json";

const INDEX_NAME = "authors";

console.log("Fetching authors data...");
const authors = await getAuthorsData();
const authorIdToBooks = (await getBooksData()).reduce(
  (acc, book) => {
    const authorId = book.authorId;
    if (!authorId) return acc;

    // @ts-ignore
    delete book.authorId;
    // @ts-ignore
    delete book.nameVariations;

    if (!acc[authorId]) acc[authorId] = [];

    // @ts-ignore
    acc[authorId].push(book);
    return acc;
  },
  {} as Record<
    string,
    Omit<Awaited<ReturnType<typeof getBooksData>>, "authorId">
  >,
);

try {
  console.log("Deleting authors index...");
  // delete the index if it already exists
  await client.collections(INDEX_NAME).delete();
} catch (e) {}

console.log("Creating authors index...");
await client.collections().create({
  name: INDEX_NAME,
  enable_nested_fields: true,
  fields: [
    {
      name: "id",
      type: "string",
    },
    {
      name: "year",
      type: "int32",
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
      // this is an internal field that we'll use to search for name variations
      name: "_nameVariations",
      type: "string[]",
      optional: true,
    },
    {
      name: "books",
      type: "object[]",
      index: false, // don't index books
      optional: true,
    },
  ],
});

const batches = chunk(authors, 200) as (typeof authors)[];

// const foundVariations: object[] = [];

let i = 1;
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);

  await client
    .collections(INDEX_NAME)
    .documents()
    .import(
      batch.map((author) => {
        return {
          ...author,
          books: authorIdToBooks[author.id] ?? [],
        };
      }),
    );
  i++;
}
console.log("\n");

const aliases = Object.keys(nameAliases as Record<string, string[]>)
  // @ts-ignore
  .filter((a) => !!nameAliases[a] && nameAliases[a].length > 0)
  .map((alias) => ({
    name: alias,
    // @ts-ignore
    aliases: [alias, ...nameAliases[alias]] as string[],
  }));

const aliasChunks = chunk(aliases, 100) as (typeof aliases)[];

let j = 1;
for (const chunk of aliasChunks) {
  console.log(`Indexing aliases batch ${j} / ${aliasChunks.length}`);
  await Promise.all(
    chunk.map((a, index) =>
      client
        .collections(INDEX_NAME)
        .synonyms()
        .upsert(`chunk-${j}:idx-${index}`, { synonyms: a.aliases }),
    ),
  );
  j++;
}

console.log(`Indexed ${authors.length} authors`);
