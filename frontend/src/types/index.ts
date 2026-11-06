export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface FamilyMember {
  id: number;
  user_id: number;
  role: 'admin' | 'member';
  nickname?: string;
  joined_at: string;
  user: User;
}

export interface FamilyGroup {
  id: number;
  name: string;
  cover_image?: string;
  admin_id: number;
  created_at: string;
  members: FamilyMember[];
}

export interface TripParticipant {
  id: number;
  trip_id: number;
  user_id?: number;
  name: string;
  email?: string;
  is_external: boolean;
}

export interface Trip {
  id: number;
  family_id: number;
  created_by_id?: number;
  title: string;
  category: string;
  status: 'rascunho' | 'planejamento' | 'confirmada' | 'em_andamento' | 'realizada' | 'cancelada';
  start_date: string;
  end_date: string;
  main_destination?: string;
  description?: string;
  notes?: string;
  cover_image?: string;
  general_rating?: number;
  review_comments?: string;
  created_at: string;
  updated_at: string;
  participants: TripParticipant[];
}

export interface Destination {
  id: number;
  family_id?: number;
  trip_id?: number;
  city: string;
  state_region?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  arrival_date?: string;
  departure_date?: string;
  description?: string;
  notes?: string;
  cover_image?: string;
  is_catalog: boolean;
}

export interface AttractionReview {
  id: number;
  attraction_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  visit_date?: string;
  created_at: string;
  user?: User;
}

export interface Attraction {
  id: number;
  family_id?: number;
  destination_id?: number;
  name: string;
  category: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  opening_hours?: string;
  price_range?: string;
  booking_link?: string;
  image_url?: string;
  description?: string;
  notes?: string;
  is_favorite: boolean;
  average_rating?: number;
  reviews?: AttractionReview[];
}

export interface Activity {
  id: number;
  trip_id: number;
  destination_id?: number;
  attraction_id?: number;
  title: string;
  category: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  time?: string;
  estimated_duration_minutes?: number;
  estimated_cost: number;
  is_completed: boolean;
  order_index: number;
  notes?: string;
  external_link?: string;
}

export interface Reservation {
  id: number;
  trip_id: number;
  destination_id?: number;
  type: 'hospedagem' | 'voo' | 'transporte' | 'restaurante' | 'ingresso' | 'seguro';
  title: string;
  provider?: string;
  start_datetime?: string;
  end_datetime?: string;
  booking_code?: string;
  contact_phone?: string;
  contact_email?: string;
  total_value: number;
  currency: string;
  payment_status: 'pago' | 'pendente';
  details_json?: string;
  notes?: string;
}

export interface DocumentItem {
  id: number;
  family_id: number;
  trip_id?: number;
  reservation_id?: number;
  user_id?: number;
  title: string;
  doc_type: string;
  doc_number?: string;
  issue_date?: string;
  expiration_date?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  notes?: string;
  created_at: string;
}

export interface ExpenseSplit {
  id: number;
  expense_id: number;
  user_id?: number;
  participant_name: string;
  split_amount: number;
  is_settled: boolean;
}

export interface Expense {
  id: number;
  trip_id: number;
  reservation_id?: number;
  paid_by_id?: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  payment_status: 'pago' | 'pendente';
  notes?: string;
  splits?: ExpenseSplit[];
}

export interface FinancialSummary {
  total_budget: number;
  total_spent: number;
  total_pending: number;
  balance: number;
  by_category: Record<string, { budgeted: number; spent: number; pending: number }>;
  by_person: Record<string, number>;
}

export interface ChecklistItem {
  id: number;
  trip_id: number;
  assigned_to_id?: number;
  title: string;
  category: string;
  priority: 'baixa' | 'media' | 'alta';
  due_date?: string;
  is_completed: boolean;
  notes?: string;
}

export interface LuggageItem {
  id: number;
  trip_id: number;
  user_id: number;
  description: string;
  category: string;
  quantity: number;
  is_packed: boolean;
  notes?: string;
}

export interface EmergencyContact {
  id: number;
  family_id: number;
  user_id?: number;
  name: string;
  phone: string;
  relationship_label?: string;
  notes?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}
