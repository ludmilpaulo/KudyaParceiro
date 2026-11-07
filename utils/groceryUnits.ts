const UNIT_SUFFIX: Record<string, string> = {
  item: "UnitItem",
  kg: "UnitKg",
  g: "UnitG",
  l: "UnitL",
  ml: "UnitMl",
  pack: "UnitPack",
  box: "UnitBox",
  bottle: "UnitBottle",
  dozen: "UnitDozen",
  tray: "UnitTray",
};

const PARTNER_STATUS_KEYS: Record<string, string> = {
  active: "gpActive",
  in_stock: "gpInStock",
  out_of_stock: "gpOutOfStock",
  low_stock: "gpLowStockStatus",
  draft: "gpDraft",
  pending_approval: "gpPendingApproval",
  inactive: "gpInactive",
};

const ORDER_STATUS_KEYS: Record<string, string> = {
  new: "gpStatusNew",
  accepted: "gpStatusAccepted",
  preparing: "gpStatusPreparing",
  ready: "gpStatusReady",
  picked_up: "gpStatusPickedUp",
  delivered: "gpStatusDelivered",
  cancelled: "gpStatusCancelled",
  refunded: "gpStatusRefunded",
};

const STOCK_REASON_KEYS: Record<string, string> = {
  received: "gpReasonReceived",
  sale: "gpReasonSale",
  manual: "gpReasonManual",
  damaged: "gpReasonDamaged",
  expired: "gpReasonExpired",
  returned: "gpReasonReturned",
  correction: "gpReasonCorrection",
};

export function sellingUnitTranslationKey(
  unit?: string | null,
  scope: "gp" | "grocery" = "gp",
): string {
  const suffix = UNIT_SUFFIX[(unit || "item").toLowerCase()] ?? "UnitItem";
  return `${scope}${suffix}`;
}

export function partnerStatusTranslationKey(status?: string | null): string {
  return PARTNER_STATUS_KEYS[(status || "").toLowerCase()] ?? "gpActive";
}

export function groceryOrderStatusTranslationKey(status?: string | null): string {
  return ORDER_STATUS_KEYS[(status || "").toLowerCase()] ?? "gpStatusNew";
}

export function stockReasonTranslationKey(reason?: string | null): string {
  return STOCK_REASON_KEYS[(reason || "").toLowerCase()] ?? "gpReasonManual";
}
