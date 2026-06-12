export function getSetting<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : defaultValue;
}

export function setSetting<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getDirection(): "rtl" | "ltr" {
  return getSetting<"rtl" | "ltr">("injaz_direction", "rtl");
}

export function setDirection(dir: "rtl" | "ltr"): void {
  setSetting("injaz_direction", dir);
  document.documentElement.dir = dir;
  document.documentElement.lang = dir === "rtl" ? "ar" : "en";
}
