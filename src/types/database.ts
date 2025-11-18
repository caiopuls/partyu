export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string | null;
  city: string;
  state: string;
  venue: string | null;
  address: string | null;
  event_date: string;
  banner_url: string | null;
  image_urls: string[] | null;
  featured_image_url: string | null;
  category: string;
  organizer_id: string | null;
  status: "draft" | "active" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
};

export type EventTicketType = {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price: number;
  platform_fee_percentage: number;
  total_quantity: number;
  sold_quantity: number;
  lot_number: number;
  status: "active" | "sold_out" | "inactive";
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  origin: "primary" | "resale";
  created_at: string;
  updated_at: string;
};

export type UserTicket = {
  id: string;
  user_id: string;
  order_id: string | null;
  event_id: string;
  ticket_type_id: string | null;
  status: "active" | "listed" | "sold" | "used" | "cancelled";
  qr_code: string | null;
  ticket_number: string | null;
  created_at: string;
  updated_at: string;
};

export type ResaleListing = {
  id: string;
  ticket_id: string;
  seller_id: string;
  asking_price: number;
  platform_fee_percentage: number;
  status: "active" | "reserved" | "sold" | "cancelled";
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type WalletLedger = {
  id: string;
  wallet_id: string;
  user_id: string;
  amount: number;
  type: "sale_commission" | "ticket_sale" | "withdraw" | "refund" | "adjustment";
  description: string | null;
  reference_id: string | null;
  created_at: string;
};

export type PaymentTransaction = {
  id: string;
  order_id: string | null;
  external_id: string;
  payment_type: "pix";
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled" | "refunded";
  metadata: Record<string, unknown> | null;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};


