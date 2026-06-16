const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /javascript\s*:/gi;
const EVENT_RE = /\bon\w+\s*=/gi;

export function sanitize(input: string): string {
  return input
    .replace(HTML_TAG_RE, "")
    .replace(SCRIPT_RE, "")
    .replace(EVENT_RE, "")
    .trim();
}
