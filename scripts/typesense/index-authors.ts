import { client } from "@/lib/typesense";

type Author = {
  author_ar: string[];
  author_lat: string[];
  author_name_from_uri: string;
  books: string[];
  date: string; // yyyy
  full_name: string;
  geo: string[];
  name_elements: string[];
  shuhra: string;
  uri: string; // gh uri
  vers_uri: string;
};

const INDEX_NAME = "authors";

console.log("Fetching authors data...");
const authorsData: Record<string, Author> = await (
  await fetch(
    "https://raw.githubusercontent.com/OpenITI/kitab-metadata-automation/master/output/OpenITI_Github_clone_all_author_meta.json?v1",
  )
).json();

try {
  console.log("Deleting authors index...");
  // delete the index if it already exists
  await client.collections(INDEX_NAME).delete();
} catch (e) {}

console.log("Creating authors index...");
await client.collections().create({
  name: INDEX_NAME,
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
    },
    {
      name: "otherArabicNames",
      type: "string[]",
    },
    {
      name: "primaryLatinName",
      type: "string",
    },
    {
      name: "otherLatinNames",
      type: "string[]",
    },
    {
      name: "shuhra",
      type: "string",
      optional: true,
    },
  ],
});

const chunk = (arr: any[], size: number) => {
  return arr.reduce(
    (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
    [],
  );
};

const dedeupeNames = (names: string[]) => {
  return Array.from(new Set(names.map((n) => n.trim())));
};

const authorsDataArray = Object.values(authorsData);
const batches = chunk(authorsDataArray, 100);

let i = 1;
let total = 0;
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);

  const operations = batch.map((author: Author) => {
    const [primaryArabicName, ...otherArabicNames] = dedeupeNames(
      author.author_ar,
    );
    const [primaryLatinName, ...otherLatinNames] = dedeupeNames(
      author.author_lat,
    );

    return {
      id: author.uri,
      year: Number(author.date),
      primaryArabicName,
      otherArabicNames,
      primaryLatinName,
      otherLatinNames,
      shuhra: author.shuhra,
    };
  });

  await client.collections(INDEX_NAME).documents().import(operations);
  total += operations.length;
  i++;
}

console.log(`Indexed ${total} authors out of ${authorsDataArray.length}`);
