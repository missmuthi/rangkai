import { fetchGoogleBooks } from "./google";
import { fetchOpenLibrary } from "./openlibrary";
import { fetchLoc } from "./loc";
import type { BookMetadata, MetadataFetchResult } from "./types";
import { createEmptyMetadata } from "./types";

// NOTE: Do NOT re-export individual fetchers here.
// Nuxt auto-imports from each file; re-exporting causes "Duplicated imports" warnings.
export * from "./types";

/**
 * Fetch book metadata from multiple sources in parallel and merge results
 * Priority: Google Books > OpenLibrary > Library of Congress
 */
export async function fetchBookByIsbn(
  isbn: string
): Promise<{ data: BookMetadata | null; meta: unknown }> {
  const startTime = Date.now();

  // Run all fetchers in parallel
  const results = await Promise.allSettled([
    measureFetch("google", () => fetchGoogleBooks(isbn)),
    measureFetch("openlibrary", () => fetchOpenLibrary(isbn)),
    measureFetch("loc", () => fetchLoc(isbn)),
  ]);

  // Process results
  const successfulResults: MetadataFetchResult[] = [];
  const errors: unknown[] = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      successfulResults.push(result.value);
    } else {
      errors.push(result.reason);
    }
  });

  // Filter out null data (fetchers return null if not found)
  const validData = successfulResults.filter((r) => r.data !== null);

  const meta = {
    totalDuration: Date.now() - startTime,
    sourcesAttempted: ["google", "openlibrary", "loc"],
    sourcesFound: validData.map((r) => r.source),
    individualDurations: successfulResults.reduce(
      (acc, r) => ({ ...acc, [r.source]: r.durationMs }),
      {}
    ),
  };

  if (validData.length === 0) {
    return { data: null, meta };
  }

  // Merge logic: Start with empty and overlay data in reverse priority order (Low -> High)
  // Priority: Google (High) > OpenLibrary > LoC (Low)
  // So we merge: LoC -> OpenLibrary -> Google
  // Actually, a better way is to grab the best available field.

  // Find specific source objects
  const google = validData.find((r) => r.source === "google")?.data;
  const ol = validData.find((r) => r.source === "openlibrary")?.data;
  const loc = validData.find((r) => r.source === "loc")?.data;

  // Base object (can use LoC or empty)
  const merged: BookMetadata = createEmptyMetadata(isbn, "google"); // Default to google as primary source type if mixed

  // Helper to pick best value
  const pick = <K extends keyof BookMetadata>(
    key: K,
    ...sources: (BookMetadata | undefined | null)[]
  ): BookMetadata[K] => {
    for (const source of sources) {
      if (source && source[key] !== null && source[key] !== undefined) {
        // Special checks for arrays (empty arrays don't count)
        if (
          Array.isArray(source[key]) &&
          (source[key] as unknown[]).length === 0
        )
          continue;
        return source[key];
      }
    }
    return merged[key]; // Default
  };

  // Merge fields (Google > OL > LoC)
  merged.title = pick("title", google, ol, loc);
  merged.subtitle = pick("subtitle", google, ol, loc);
  merged.authors = pick("authors", google, ol, loc);
  merged.publisher = pick("publisher", google, ol, loc);
  merged.publishedDate = pick("publishedDate", google, ol, loc);
  merged.description = pick("description", google, ol, loc); // Maybe prefer longer description?
  merged.pageCount = pick("pageCount", google, ol, loc);
  merged.categories = pick("categories", google, ol, loc);
  merged.language = pick("language", google, ol, loc);
  merged.thumbnail = pick("thumbnail", google, ol, loc);

  // Determine primary source for attribution
  if (google) merged.source = "google";
  else if (ol) merged.source = "openlibrary";
  else if (loc) merged.source = "loc";

  // Special case: Description length check?
  // Sometimes OL has better descriptions than a short Google snippet.
  if (
    ol?.description &&
    google?.description &&
    ol.description.length > google.description.length
  ) {
    merged.description = ol.description;
  }

  return { data: merged, meta };
}

async function measureFetch(
  source: string,
  fetcher: () => Promise<BookMetadata | null>
): Promise<MetadataFetchResult> {
  const start = Date.now();
  try {
    const data = await fetcher();
    return {
      data,
      source,
      durationMs: Date.now() - start,
    };
  } catch (error) {
    return {
      data: null,
      source,
      error: String(error),
      durationMs: Date.now() - start,
    };
  }
}
