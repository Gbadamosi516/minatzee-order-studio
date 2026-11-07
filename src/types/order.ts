export type ProductCategory = "Women's Innerwear" | "Children's Innerwear" | "Other";

export type PaymentStatus = "Awaiting Payment" | "Part Payment" | "Paid";

export type OrderStage = 
  | "New Chats"
  | "Awaiting Payment"
  | "To Pack"
  | "Shipped"
  | "Done & Happy";

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  whatsappContact?: string;
  productDescription: string;
  productCategory: ProductCategory;
  size: string;
  quantity: number;
  orderAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  orderStage: OrderStage;
  orderDate: string; // YYYY-MM-DD
  dispatchDate: string; // YYYY-MM-DD
  notes: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type SortOption = 
  | "newest" 
  | "oldest" 
  | "highest_amount" 
  | "lowest_amount";

export type DateFilterOption = 
  | "all_time" 
  | "today" 
  | "yesterday" 
  | "last_7_days" 
  | "last_30_days";

export interface FilterState {
  searchQuery: string;
  stage: OrderStage | "all";
  paymentStatus: PaymentStatus | "all";
  dateRange: DateFilterOption;
  sortBy: SortOption;
}

export interface BusinessSettings {
  businessName: string;
  brandTagline: string;
  location: string;
  businessRegNumber: string;
  ownerName: string;
}
