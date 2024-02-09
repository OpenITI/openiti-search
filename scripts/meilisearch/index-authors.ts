import { client } from "@/lib/meilisearch";

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
  await client.index(INDEX_NAME).delete();
} catch (e) {}

console.log("Creating authors index...");
await client.createIndex(INDEX_NAME, {
  primaryKey: "id",
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
    return {
      id: author.uri,
      year: Number(author.date),
      arabicNames: dedeupeNames(author.author_ar),
      latinNames: dedeupeNames(author.author_lat),
      shuhra: author.shuhra,
    };
  });

  await client.index(INDEX_NAME).addDocuments(operations);
  total += operations.length;
  i++;
}

console.log(`Indexed ${total} authors out of ${authorsDataArray.length}`);
