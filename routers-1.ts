// routers.ts — نسخة كاملة مع الإشعارات مفعّلة
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendOwnerNotification } from "./notifications";

import {
  getMenuItems,
  getMenuItemsByCategory,
  getGalleryImages,
  createReservation,
  getReservations,
  createDeliveryOrder,
  getDeliveryOrders,
  getRestaurantSettings,
  updateRestaurantSettings,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  createGalleryImage,
  deleteGalleryImage,
  updateReservationStatus,
  updateDeliveryOrderStatus,
} from "./db";

function requireAdmin(role: string | undefined) {
  if (role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  menu: router({
    list: publicProcedure.query(async () => getMenuItems()),
    byCategory: publicProcedure.input(z.string()).query(async ({ input }) => getMenuItemsByCategory(input)),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), description: z.string().optional(), price: z.number().int().positive(), category: z.string().min(1), image: z.string().url().optional() }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return createMenuItem(input); }),
    update: protectedProcedure
      .input(z.object({ id: z.number().int(), name: z.string().min(1).optional(), description: z.string().optional(), price: z.number().int().positive().optional(), category: z.string().optional(), image: z.string().url().optional() }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); const { id, ...data } = input; return updateMenuItem(id, data); }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return deleteMenuItem(input.id); }),
    toggleAvailable: protectedProcedure
      .input(z.object({ id: z.number().int(), available: z.union([z.literal(0), z.literal(1)]) }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return toggleMenuItemAvailability(input.id, input.available); }),
  }),

  gallery: router({
    list: publicProcedure.query(async () => getGalleryImages()),
    create: protectedProcedure
      .input(z.object({ image: z.string().url(), title: z.string().optional(), description: z.string().optional() }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return createGalleryImage(input); }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return deleteGalleryImage(input.id); }),
  }),

  reservations: router({
    create: publicProcedure
      .input(z.object({
        customerName:    z.string().min(1),
        customerEmail:   z.string().email().optional(),
        customerPhone:   z.string().min(1),
        reservationDate: z.date(),
        numberOfGuests:  z.number().int().min(1),
        specialRequests: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createReservation(input);
        // ✅ إشعار فوري — لا يوقف العملية لو فشل
        sendOwnerNotification({ type: "reservation", data: input })
          .catch(err => console.error("[Notification] reservation:", err));
        return result;
      }),

    list: protectedProcedure.query(async ({ ctx }) => { requireAdmin(ctx.user.role); return getReservations(); }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number().int(), status: z.enum(["pending","confirmed","cancelled","completed"]) }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return updateReservationStatus(input.id, input.status); }),
  }),

  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName:    z.string().min(1),
        customerPhone:   z.string().min(1),
        customerEmail:   z.string().email().optional(),
        deliveryAddress: z.string().min(1),
        items:           z.string(),
        totalPrice:      z.number().int().positive(),
        deliveryFee:     z.number().int().nonnegative(),
        notes:           z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await createDeliveryOrder(input);
        // ✅ إشعار فوري — لا يوقف العملية لو فشل
        sendOwnerNotification({ type: "order", data: input })
          .catch(err => console.error("[Notification] order:", err));
        return result;
      }),

    list: protectedProcedure.query(async ({ ctx }) => { requireAdmin(ctx.user.role); return getDeliveryOrders(); }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number().int(), status: z.enum(["pending","confirmed","preparing","ready","delivered","cancelled"]) }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return updateDeliveryOrderStatus(input.id, input.status); }),
  }),

  settings: router({
    get: publicProcedure.query(async () => getRestaurantSettings()),
    update: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(), description: z.string().optional(),
        phone: z.string().optional(), email: z.string().email().optional(),
        address: z.string().optional(), latitude: z.string().optional(), longitude: z.string().optional(),
        deliveryEnabled: z.union([z.literal(0), z.literal(1)]).optional(),
        deliveryFeeBase: z.number().int().nonnegative().optional(),
        minOrderAmount:  z.number().int().nonnegative().optional(),
        openingHours:    z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => { requireAdmin(ctx.user.role); return updateRestaurantSettings(input); }),
  }),
});

export type AppRouter = typeof appRouter;
