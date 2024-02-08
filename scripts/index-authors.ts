import { client } from "@/lib/elastic";
import { ErrorCause } from "@elastic/elasticsearch/lib/api/types";

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
  await client.indices.delete({ index: INDEX_NAME });
} catch (e) {}

console.log("Creating authors index...");
await client.indices.create(
  {
    index: INDEX_NAME,
    mappings: {
      properties: {
        id: { type: "keyword" }, // uri
        year: { type: "integer" },
        arabicNames: {
          type: "text",
          analyzer: "arabic",
          fields: {
            raw: {
              type: "keyword",
            },
            space: {
              type: "text",
              analyzer: "whitespace",
            },
            search_as_you_type: {
              type: "search_as_you_type",
            },
          },
        },
        latinNames: {
          type: "text",
          fields: {
            raw: {
              type: "keyword",
            },
            space: {
              type: "text",
              analyzer: "whitespace",
            },
            search_as_you_type: {
              type: "search_as_you_type",
            },
          },
        },
        shuhra: {
          type: "text",
          fields: {
            raw: {
              type: "keyword",
            },
            space: {
              type: "text",
              analyzer: "whitespace",
            },
            search_as_you_type: {
              type: "search_as_you_type",
            },
          },
        },
      },
    },
  },
  // if the index already exists, ignore the error
  { ignore: [400] },
);

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
for (const batch of batches) {
  console.log(`Indexing batch ${i} / ${batches.length}`);

  const operations = batch.flatMap((author: Author) => {
    return [
      { index: { _index: INDEX_NAME } },
      {
        id: author.uri,
        year: Number(author.date),
        arabicNames: dedeupeNames(author.author_ar),
        latinNames: dedeupeNames(author.author_lat),
        shuhra: author.shuhra,
      },
    ];
  });

  const bulkResponse = await client.bulk({ refresh: true, operations });

  if (bulkResponse.errors) {
    const erroredDocuments: {
      // If the status is 429 it means that you can retry the document,
      // otherwise it's very likely a mapping error, and you should
      // fix the document before to try it again.
      status: number;
      error: ErrorCause | undefined;
      operation: any;
      document: any;
    }[] = [];

    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]! as keyof typeof action;
      if (!action[operation]) return;

      if (action[operation]!.error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation]!.status,
          error: action[operation]!.error,
          operation: operations[i * 2],
          document: operations[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  i++;
}

const count = await client.count({ index: INDEX_NAME });
console.log(`Indexed ${count.count} authors out of ${authorsDataArray.length}`);
