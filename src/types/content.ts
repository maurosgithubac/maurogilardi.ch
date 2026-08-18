export type PostRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string;
  image_path: string | null;
  published: boolean;
  created_at: string;
};

export type SponsorRow = {
  id: string;
  name: string;
  logo_path: string;
  website_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type GoennerInquiryStatus = "open" | "completed" | "exited";

export type GoennerInquiryRow = {
  id: string;
  membership_id: string;
  name: string;
  email: string;
  phone: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  message: string | null;
  /** Interner Admin-Kommentar (optional, Migration 011_goenner_inquiries_inbox_fields.sql) */
  admin_note?: string | null;
  created_at: string;
  /** Nach Migration 007_goenner_inquiries_status_amount.sql (+ 011 inbox_fields) */
  status?: GoennerInquiryStatus;
  completed_at?: string | null;
  amount_chf?: number | null;
};
