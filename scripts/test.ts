import { fetchAuthorsData } from "@/lib/api";

const data = Object.values(await fetchAuthorsData());

const dataWithShuhra = data.filter((d) => !d.date);

console.log(dataWithShuhra);

/**
 * 1. use shuhra as a primary name if it exists
 * 2. add a new name to the array with all tashkeel removed
 * 3. remove full_name and add it to names array (if it doesn't exist)
 */
