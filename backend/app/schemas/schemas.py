import datetime as dt
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# -------------------------------------------------------------
# Common
# -------------------------------------------------------------
class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    database: str

# -------------------------------------------------------------
# Auth & User (RF01)
# -------------------------------------------------------------
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class TokenPayload(BaseModel):
    sub: Optional[str] = None

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: dt.datetime

# -------------------------------------------------------------
# Family & Invites (RF02)
# -------------------------------------------------------------
class FamilyGroupCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    cover_image: Optional[str] = None

class FamilyMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    role: str
    nickname: Optional[str] = None
    joined_at: dt.datetime
    user: UserOut

class FamilyInviteCreate(BaseModel):
    email: EmailStr

class FamilyInviteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: int
    email: EmailStr
    token: str
    status: str
    expires_at: dt.datetime
    created_at: dt.datetime

class FamilyGroupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cover_image: Optional[str] = None
    admin_id: int
    created_at: dt.datetime
    members: List[FamilyMemberOut] = []

# -------------------------------------------------------------
# Trips & Participants (RF03, RF04, RF05, RF37)
# -------------------------------------------------------------
class TripParticipantCreate(BaseModel):
    user_id: Optional[int] = None
    name: str
    email: Optional[EmailStr] = None
    is_external: bool = False

class TripParticipantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    user_id: Optional[int] = None
    name: str
    email: Optional[str] = None
    is_external: bool
    created_at: dt.datetime

class TripCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    category: str = "ferias"
    status: str = "planejamento"
    start_date: dt.date
    end_date: dt.date
    main_destination: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    cover_image: Optional[str] = None
    participants: Optional[List[TripParticipantCreate]] = None

class TripUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[dt.date] = None
    end_date: Optional[dt.date] = None
    main_destination: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    cover_image: Optional[str] = None
    general_rating: Optional[float] = None
    review_comments: Optional[str] = None

class TripOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: int
    created_by_id: Optional[int] = None
    title: str
    category: str
    status: str
    start_date: dt.date
    end_date: dt.date
    main_destination: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    cover_image: Optional[str] = None
    general_rating: Optional[float] = None
    review_comments: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime
    participants: List[TripParticipantOut] = []

# -------------------------------------------------------------
# Destinations & Catalog (RF05, RF06)
# -------------------------------------------------------------
class DestinationCreate(BaseModel):
    trip_id: Optional[int] = None
    city: str
    state_region: Optional[str] = None
    country: str = "Brasil"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    arrival_date: Optional[dt.date] = None
    departure_date: Optional[dt.date] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    cover_image: Optional[str] = None
    is_catalog: bool = False

class DestinationUpdate(BaseModel):
    city: Optional[str] = None
    state_region: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    arrival_date: Optional[dt.date] = None
    departure_date: Optional[dt.date] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    cover_image: Optional[str] = None
    is_catalog: Optional[bool] = None

class DestinationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: Optional[int] = None
    trip_id: Optional[int] = None
    city: str
    state_region: Optional[str] = None
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    arrival_date: Optional[dt.date] = None
    departure_date: Optional[dt.date] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    cover_image: Optional[str] = None
    is_catalog: bool
    created_at: dt.datetime
    updated_at: dt.datetime

# -------------------------------------------------------------
# Attractions & Reviews (RF07, RF08)
# -------------------------------------------------------------
class AttractionReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    visit_date: Optional[dt.date] = None

class AttractionReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    attraction_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    visit_date: Optional[dt.date] = None
    created_at: dt.datetime
    user: Optional[UserOut] = None

class AttractionCreate(BaseModel):
    destination_id: Optional[int] = None
    name: str
    category: str = "ponto_turistico"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    price_range: Optional[str] = None
    booking_link: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: bool = False

class AttractionUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    price_range: Optional[str] = None
    booking_link: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: Optional[bool] = None

class AttractionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: Optional[int] = None
    destination_id: Optional[int] = None
    name: str
    category: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    price_range: Optional[str] = None
    booking_link: Optional[str] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    is_favorite: bool
    created_at: dt.datetime
    updated_at: dt.datetime
    reviews: List[AttractionReviewOut] = []
    average_rating: Optional[float] = None

# -------------------------------------------------------------
# Activities & Itineraries (RF09)
# -------------------------------------------------------------
class ActivityCreate(BaseModel):
    trip_id: int
    destination_id: Optional[int] = None
    attraction_id: Optional[int] = None
    title: str
    category: str = "passeio"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date: Optional[dt.date] = None # None means unassigned date (RF09)
    time: Optional[dt.time] = None
    estimated_duration_minutes: Optional[int] = None
    estimated_cost: float = 0.00
    is_completed: bool = False
    order_index: int = 0
    notes: Optional[str] = None
    external_link: Optional[str] = None

class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date: Optional[dt.date] = None
    time: Optional[dt.time] = None
    estimated_duration_minutes: Optional[int] = None
    estimated_cost: Optional[float] = None
    is_completed: Optional[bool] = None
    order_index: Optional[int] = None
    notes: Optional[str] = None
    external_link: Optional[str] = None

class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    destination_id: Optional[int] = None
    attraction_id: Optional[int] = None
    title: str
    category: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date: Optional[dt.date] = None
    time: Optional[dt.time] = None
    estimated_duration_minutes: Optional[int] = None
    estimated_cost: float
    is_completed: bool
    order_index: int
    notes: Optional[str] = None
    external_link: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime

# -------------------------------------------------------------
# Reservations (RF11 to RF15, RF18, RF19)
# -------------------------------------------------------------
class ReservationCreate(BaseModel):
    trip_id: int
    destination_id: Optional[int] = None
    type: str # hospedagem, voo, transporte, restaurante, ingresso, seguro
    title: str
    provider: Optional[str] = None
    start_datetime: Optional[dt.datetime] = None
    end_datetime: Optional[dt.datetime] = None
    booking_code: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    total_value: float = 0.00
    currency: str = "BRL"
    payment_status: str = "pendente" # pago, pendente
    details_json: Optional[str] = "{}"
    notes: Optional[str] = None

class ReservationUpdate(BaseModel):
    title: Optional[str] = None
    provider: Optional[str] = None
    start_datetime: Optional[dt.datetime] = None
    end_datetime: Optional[dt.datetime] = None
    booking_code: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    total_value: Optional[float] = None
    currency: Optional[str] = None
    payment_status: Optional[str] = None
    details_json: Optional[str] = None
    notes: Optional[str] = None

class ReservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    destination_id: Optional[int] = None
    type: str
    title: str
    provider: Optional[str] = None
    start_datetime: Optional[dt.datetime] = None
    end_datetime: Optional[dt.datetime] = None
    booking_code: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    total_value: float
    currency: str
    payment_status: str
    details_json: Optional[str] = "{}"
    notes: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime

# -------------------------------------------------------------
# Documents (RF20, RF21, RF22)
# -------------------------------------------------------------
class DocumentCreate(BaseModel):
    family_id: int
    trip_id: Optional[int] = None
    reservation_id: Optional[int] = None
    user_id: Optional[int] = None
    title: str
    doc_type: str = "outros"
    doc_number: Optional[str] = None
    issue_date: Optional[dt.date] = None
    expiration_date: Optional[dt.date] = None
    notes: Optional[str] = None

class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: int
    trip_id: Optional[int] = None
    reservation_id: Optional[int] = None
    user_id: Optional[int] = None
    title: str
    doc_type: str
    doc_number: Optional[str] = None
    issue_date: Optional[dt.date] = None
    expiration_date: Optional[dt.date] = None
    file_path: str
    file_name: str
    file_size: int
    file_type: str
    notes: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime

# -------------------------------------------------------------
# Finances & Budgets (RF16, RF17, RF18)
# -------------------------------------------------------------
class ExpenseSplitCreate(BaseModel):
    user_id: Optional[int] = None
    participant_name: str
    split_amount: float
    is_settled: bool = False

class ExpenseSplitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expense_id: int
    user_id: Optional[int] = None
    participant_name: str
    split_amount: float
    is_settled: bool

class ExpenseCreate(BaseModel):
    trip_id: int
    reservation_id: Optional[int] = None
    paid_by_id: Optional[int] = None
    title: str
    category: str
    amount: float
    date: dt.date
    payment_status: str = "pago"
    notes: Optional[str] = None
    splits: Optional[List[ExpenseSplitCreate]] = None

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[dt.date] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None
    paid_by_id: Optional[int] = None

class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    reservation_id: Optional[int] = None
    paid_by_id: Optional[int] = None
    title: str
    category: str
    amount: float
    date: dt.date
    payment_status: str
    notes: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime
    splits: List[ExpenseSplitOut] = []

class BudgetCategoryCreate(BaseModel):
    trip_id: int
    category: str
    budgeted_amount: float

class BudgetCategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    category: str
    budgeted_amount: float

class FinancialSummary(BaseModel):
    total_budget: float
    total_spent: float
    total_pending: float
    balance: float
    by_category: Dict[str, Dict[str, float]]
    by_person: Dict[str, float]

# -------------------------------------------------------------
# Checklists & Luggage (RF27, RF28)
# -------------------------------------------------------------
class ChecklistItemCreate(BaseModel):
    trip_id: int
    assigned_to_id: Optional[int] = None
    title: str
    category: str = "geral"
    priority: str = "media"
    due_date: Optional[dt.date] = None
    is_completed: bool = False
    notes: Optional[str] = None

class ChecklistItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[dt.date] = None
    is_completed: Optional[bool] = None
    assigned_to_id: Optional[int] = None
    notes: Optional[str] = None

class ChecklistItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    assigned_to_id: Optional[int] = None
    title: str
    category: str
    priority: str
    due_date: Optional[dt.date] = None
    is_completed: bool
    notes: Optional[str] = None
    created_at: dt.datetime
    updated_at: dt.datetime

class LuggageItemCreate(BaseModel):
    trip_id: int
    user_id: int
    description: str
    category: str = "roupas"
    quantity: int = 1
    is_packed: bool = False
    notes: Optional[str] = None

class LuggageItemUpdate(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    is_packed: Optional[bool] = None
    notes: Optional[str] = None

class LuggageItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    user_id: int
    description: str
    category: str
    quantity: int
    is_packed: bool
    notes: Optional[str] = None

# -------------------------------------------------------------
# Emergency Contacts & Google Photos (RF29, RF32)
# -------------------------------------------------------------
class EmergencyContactCreate(BaseModel):
    user_id: Optional[int] = None
    name: str
    phone: str
    relationship_label: Optional[str] = None
    notes: Optional[str] = None

class EmergencyContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: int
    user_id: Optional[int] = None
    name: str
    phone: str
    relationship_label: Optional[str] = None
    notes: Optional[str] = None
    created_at: dt.datetime

class GooglePhotoAlbumCreate(BaseModel):
    trip_id: int
    title: str
    album_url: str
    description: Optional[str] = None

class GooglePhotoAlbumOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    trip_id: int
    title: str
    album_url: str
    description: Optional[str] = None
    created_at: dt.datetime

# -------------------------------------------------------------
# Audit & Notifications (RF33, RF41)
# -------------------------------------------------------------
class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    family_id: int
    user_id: Optional[int] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    description: str
    timestamp: dt.datetime

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    scheduled_for: Optional[dt.datetime] = None
    created_at: dt.datetime

# -------------------------------------------------------------
# AI Assistant & Smart Features (RF10, RF23, RF26, RF38)
# -------------------------------------------------------------
class AIChatRequest(BaseModel):
    prompt: str
    trip_id: Optional[int] = None
    context_type: Optional[str] = "assistant"

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[Dict[str, Any]]] = None
    sources: Optional[List[str]] = None

class AIDocumentParseResponse(BaseModel):
    document_type: str
    extracted_data: Dict[str, Any]
    confidence: float
    raw_summary: str

# -------------------------------------------------------------
# Offline Sync (RF34)
# -------------------------------------------------------------
class SyncOperation(BaseModel):
    operation_id: str
    entity_type: str
    action: str
    payload: Dict[str, Any]
    client_timestamp: dt.datetime

class SyncRequest(BaseModel):
    operations: List[SyncOperation]

class SyncResponse(BaseModel):
    processed_count: int
    conflicts: List[Dict[str, Any]] = []
    status: str = "success"
