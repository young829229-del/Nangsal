import React from "react";

export interface SiteSettings {
  heroImage: string;
  aboutBrandImage: string;
  aboutBrandVideo: string;
  bankQrImage: string;
  bankAccountName: string;
  esewaQrImage: string;
  esewaHolderName: string;
  whatsappNumber: string;
  instagramUrl: string;
  tiktokUrl: string;
  targetDate: string; // ISO string
  deliveryInsideKtm: number;
  deliveryOutsideKtm: number;
  promoCode?: string;
  promoDiscountPercent?: number;
  allowedAdminEmails?: string[];
  customTerms?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number; // in USD base
  images: string[]; // multi-views for dots indicator & hover interaction
  sizes: string[];
  stock?: number;
  unavailableSizes?: string[];
  isSoldOut?: boolean;
  section: string;
  category: string;
  details: string[];
  overlayType?: string;
  imageStyle?: React.CSSProperties;
  imageAlt?: string;
  order?: number;
  sizeChartUrl?: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
  userHeight?: string;
  userWeight?: string;
}

export type CurrencyCode = "NPR" | "USD" | "AUD" | "EUR" | "GBP" | "JPY";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // conversion from base (NPR)
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  NPR: { code: "NPR", symbol: "Rs.", rate: 1.0 },
  USD: { code: "USD", symbol: "$", rate: 1 / 133 },
  AUD: { code: "AUD", symbol: "A$", rate: 1.5 / 133 },
  EUR: { code: "EUR", symbol: "€", rate: 0.92 / 133 },
  GBP: { code: "GBP", symbol: "£", rate: 0.78 / 133 },
  JPY: { code: "JPY", symbol: "¥", rate: 156.0 / 133 },
};
