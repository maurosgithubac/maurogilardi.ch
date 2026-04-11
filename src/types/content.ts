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
  created_at: string;
};
