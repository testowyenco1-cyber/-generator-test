import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type StoredOffer = {
  id: string;
  offerNumber: string;
  updatedAt: string;
  [key: string]: unknown;
};

export class StorageError extends Error {
  constructor(message: string, public readonly statusCode = 500) {
    super(message);
    this.name = "StorageError";
  }
}

function storageRoot(): string {
  const root = process.env.ENCO_STORAGE_ROOT?.trim();
  if (!root) {
    throw new StorageError(
      "Brak konfiguracji ENCO_STORAGE_ROOT. Ustaw ścieżkę do wspólnego folderu ofert.",
      503,
    );
  }
  return path.resolve(root);
}

function assertSafeSegment(value: string, label: string): string {
  if (!value || value === "." || value === ".." || /[\\/\\0]/.test(value)) {
    throw new StorageError(`Nieprawidłowy ${label}.`, 400);
  }
  return value;
}

function offerDirectory(year: string, offerId: string): string {
  const safeYear = assertSafeSegment(year, "rok");
  const safeId = assertSafeSegment(offerId, "identyfikator oferty");
  const root = storageRoot();
  const target = path.resolve(root, "OFERTY", safeYear, safeId);
  const base = path.resolve(root, "OFERTY") + path.sep;
  if (!target.startsWith(base)) {
    throw new StorageError("Nieprawidłowa ścieżka oferty.", 400);
  }
  return target;
}

async function atomicWrite(filePath: string, contents: string): Promise<void> {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, contents, { encoding: "utf8", flag: "wx" });
    await fs.rename(temporaryPath, filePath);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }
}

export async function checkStorage(): Promise<{ root: string; writable: boolean }> {
  const root = storageRoot();
  await fs.mkdir(root, { recursive: true });
  const probe = path.join(root, `.enco-write-test-${randomUUID()}`);
  await fs.writeFile(probe, "ok", { flag: "wx" });
  await fs.rm(probe);
  return { root, writable: true };
}

export async function saveOfferFile(offer: StoredOffer): Promise<void> {
  const year = new Date().getFullYear().toString();
  const directory = offerDirectory(year, offer.id);
  const filePath = path.join(directory, "oferta.json");
  const historyDirectory = path.join(directory, "historia");
  await fs.mkdir(historyDirectory, { recursive: true });

  try {
    const previous = await fs.readFile(filePath, "utf8");
    const historyPath = path.join(historyDirectory, `${Date.now()}-oferta.json`);
    await atomicWrite(historyPath, previous);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  await atomicWrite(filePath, JSON.stringify(offer, null, 2));
}

export async function readOfferFile(year: string, offerId: string): Promise<StoredOffer> {
  const filePath = path.join(offerDirectory(year, offerId), "oferta.json");
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as StoredOffer;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new StorageError("Nie znaleziono oferty.", 404);
    }
    if (error instanceof SyntaxError) {
      throw new StorageError("Plik oferty ma nieprawidłowy format JSON.", 500);
    }
    throw error;
  }
}
