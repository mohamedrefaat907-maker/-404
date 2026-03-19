// ─────────────────────────────────────────────────────────────────────────────
// db.additions.ts  –  paste these functions into your existing db.ts
// Requires: menuItems, galleryImages, restaurantSettings, deliveryOrders,
//           reservations already imported from your schema.
// ─────────────────────────────────────────────────────────────────────────────

import { eq } from "drizzle-orm";
import {
  menuItems,
  galleryImages,
  restaurantSettings,
  reservations,
  deliveryOrders,
  InsertMenuItem,
  InsertGalleryImage,
  InsertRestaurantSettings,
} from "../drizzle/schema";
import { getDb } from "./db"; // re-use your existing getDb()

// ── Menu CRUD ──────────────────────────────────────────────────────────────────

export async function createMenuItem(data: Omit<InsertMenuItem, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(menuItems).values(data);
}

export async function updateMenuItem(
  id: number,
  data: Partial<Omit<InsertMenuItem, "id" | "createdAt" | "updatedAt">>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuItems).set(data).where(eq(menuItems.id, id));
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(menuItems).where(eq(menuItems.id, id));
}

export async function toggleMenuItemAvailability(id: number, available: 0 | 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuItems).set({ available }).where(eq(menuItems.id, id));
}

// ── Gallery CRUD ───────────────────────────────────────────────────────────────

export async function createGalleryImage(
  data: Omit<InsertGalleryImage, "id" | "createdAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(galleryImages).values(data);
}

export async function deleteGalleryImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(galleryImages).where(eq(galleryImages.id, id));
}

// ── Restaurant Settings ────────────────────────────────────────────────────────
// (already have getRestaurantSettings + updateRestaurantSettings in your db.ts)
// These are safe to add as aliases if you want:

export { getRestaurantSettings, updateRestaurantSettings } from "./db";

// ── Status updates ─────────────────────────────────────────────────────────────

export async function updateReservationStatus(
  id: number,
  status: "pending" | "confirmed" | "cancelled" | "completed"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reservations).set({ status }).where(eq(reservations.id, id));
}

export async function updateDeliveryOrderStatus(
  id: number,
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(deliveryOrders).set({ status }).where(eq(deliveryOrders.id, id));
}
