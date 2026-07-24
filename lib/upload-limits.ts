/** Max printable PDF size accepted in dashboard uploads (20 MB). */
export const MAX_PRINTABLE_PDF_BYTES = 20 * 1024 * 1024;

/** Base64 data URLs are ~4/3 the binary size — allow headroom for metadata. */
export const MAX_PRINTABLE_PDF_DATA_URL_LENGTH = Math.ceil(MAX_PRINTABLE_PDF_BYTES * 1.4);
