import type { Service } from "@/types/common";
import { DEFAULT_SERVICES } from "@/lib/services-db";

const STORAGE_KEY = "injaz_services";
const SEED_VERSION_KEY = "injaz_services_seed_version_storage";
const SEED_VERSION = "2.5.0";

function getAll(): Service[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[services-storage] Failed to parse services, returning defaults:", err);
    return DEFAULT_SERVICES;
  }
}

function saveAll(services: Service[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

export function getStoredServices(): Service[] {
  return getAll();
}

export function getParentServices(): Service[] {
  return getAll().filter((s) => s.parentId === null);
}

export function getChildServices(parentId: string): Service[] {
  return getAll().filter((s) => s.parentId === parentId);
}

export function getServiceById(id: string): Service | undefined {
  return getAll().find((s) => s.id === id);
}

export function addService(service: Service): void {
  const all = getAll();
  all.push(service);
  saveAll(all);
}

export function updateService(id: string, updates: Partial<Service>): boolean {
  const all = getAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...updates };
  saveAll(all);
  return true;
}

export function deleteService(id: string): boolean {
  const all = getAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  saveAll(all);
  return true;
}

export function seedDefaultServices(): void {
  const existing = getAll();
  if (existing.length > 0) {
    const version = localStorage.getItem(SEED_VERSION_KEY);
    if (version === SEED_VERSION) return;
  }
  saveAll(DEFAULT_SERVICES);
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}
