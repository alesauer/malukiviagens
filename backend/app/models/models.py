from datetime import datetime, timezone
import json
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Date, Time,
    Float, ForeignKey, Numeric, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

# -------------------------------------------------------------
# User & Family Models (RF01, RF02)
# -------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    family_memberships = relationship("FamilyMember", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user")
    emergency_contacts = relationship("EmergencyContact", back_populates="user")
    luggage_items = relationship("LuggageItem", back_populates="user")
    reviews = relationship("AttractionReview", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    cover_image = Column(String(500), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])
    members = relationship("FamilyMember", back_populates="family", cascade="all, delete-orphan")
    invites = relationship("FamilyInvite", back_populates="family", cascade="all, delete-orphan")
    trips = relationship("Trip", back_populates="family", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="family", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="family", cascade="all, delete-orphan")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), default="member") # admin, member
    nickname = Column(String(100), nullable=True)
    joined_at = Column(DateTime(timezone=True), default=utcnow)

    family = relationship("FamilyGroup", back_populates="members")
    user = relationship("User", back_populates="family_memberships")


class FamilyInvite(Base):
    __tablename__ = "family_invites"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    token = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(20), default="pending") # pending, accepted, rejected
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    family = relationship("FamilyGroup", back_populates="invites")


# -------------------------------------------------------------
# Trip & Destination Models (RF03, RF04, RF05, RF06)
# -------------------------------------------------------------
class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="ferias") # ferias, nacional, internacional, fim_de_semana, feriado, passeio, excursao, profissional, outros
    status = Column(String(30), default="planejamento", index=True) # rascunho, planejamento, confirmada, em_andamento, realizada, cancelada
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    main_destination = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    general_rating = Column(Float, nullable=True) # RF37
    review_comments = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    family = relationship("FamilyGroup", back_populates="trips")
    created_by = relationship("User", foreign_keys=[created_by_id])
    destinations = relationship("Destination", back_populates="trip", cascade="all, delete-orphan")
    participants = relationship("TripParticipant", back_populates="trip", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="trip", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    budgets = relationship("BudgetCategory", back_populates="trip", cascade="all, delete-orphan")
    checklists = relationship("ChecklistItem", back_populates="trip", cascade="all, delete-orphan")
    luggage_items = relationship("LuggageItem", back_populates="trip", cascade="all, delete-orphan")
    photo_albums = relationship("GooglePhotoAlbum", back_populates="trip", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="trip")


class TripParticipant(Base):
    __tablename__ = "trip_participants"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True)
    is_external = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    trip = relationship("Trip", back_populates="participants")
    user = relationship("User")


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=True, index=True)
    city = Column(String(150), nullable=False)
    state_region = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False, default="Brasil")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    arrival_date = Column(Date, nullable=True)
    departure_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    is_catalog = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    trip = relationship("Trip", back_populates="destinations")
    attractions = relationship("Attraction", back_populates="destination", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="destination")


# -------------------------------------------------------------
# Attraction & Reviews Models (RF07, RF08)
# -------------------------------------------------------------
class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=True, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), default="ponto_turistico") # ponto_turistico, restaurante, museu, parque, show, compras, outros
    address = Column(String(300), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    phone = Column(String(50), nullable=True)
    website = Column(String(300), nullable=True)
    opening_hours = Column(String(200), nullable=True)
    price_range = Column(String(50), nullable=True) # $, $$, $$$, $$$$
    booking_link = Column(String(300), nullable=True)
    image_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    destination = relationship("Destination", back_populates="attractions")
    reviews = relationship("AttractionReview", back_populates="attraction", cascade="all, delete-orphan")


class AttractionReview(Base):
    __tablename__ = "attraction_reviews"

    id = Column(Integer, primary_key=True, index=True)
    attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False) # 1 to 5
    comment = Column(Text, nullable=True)
    visit_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    attraction = relationship("Attraction", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


# -------------------------------------------------------------
# Activities & Itineraries (RF09)
# -------------------------------------------------------------
class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="SET NULL"), nullable=True)
    attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="passeio")
    address = Column(String(300), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    date = Column(Date, nullable=True) # If null: atividade sem data definida (RF09)
    time = Column(Time, nullable=True)
    estimated_duration_minutes = Column(Integer, nullable=True)
    estimated_cost = Column(Numeric(10, 2), default=0.00)
    is_completed = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    external_link = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    trip = relationship("Trip", back_populates="activities")
    destination = relationship("Destination", back_populates="activities")
    attraction = relationship("Attraction")


# -------------------------------------------------------------
# Reservations (RF11, RF12, RF13, RF14, RF15, RF18, RF19)
# -------------------------------------------------------------
class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_id = Column(Integer, ForeignKey("destinations.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(30), nullable=False, index=True) # hospedagem, voo, transporte, restaurante, ingresso, seguro
    title = Column(String(200), nullable=False)
    provider = Column(String(150), nullable=True)
    start_datetime = Column(DateTime(timezone=True), nullable=True)
    end_datetime = Column(DateTime(timezone=True), nullable=True)
    booking_code = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    total_value = Column(Numeric(10, 2), default=0.00)
    currency = Column(String(10), default="BRL")
    payment_status = Column(String(20), default="pendente") # pago, pendente
    details_json = Column(Text, default="{}") # Specific fields for flights, car rentals, hotel rooms, insurance policies
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    trip = relationship("Trip", back_populates="reservations")
    expenses = relationship("Expense", back_populates="reservation")
    documents = relationship("Document", back_populates="reservation")


# -------------------------------------------------------------
# Documents (RF20, RF21, RF22)
# -------------------------------------------------------------
class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True) # associated personal doc
    title = Column(String(200), nullable=False)
    doc_type = Column(String(50), default="outros") # passaporte, rg, cpf, cnh, visto, vacina, voucher, bilhete, comprovante, apolice, outros
    doc_number = Column(String(100), nullable=True)
    issue_date = Column(Date, nullable=True)
    expiration_date = Column(Date, nullable=True)
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False) # bytes
    file_type = Column(String(100), nullable=False) # application/pdf, image/jpeg, image/png
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    family = relationship("FamilyGroup", back_populates="documents")
    trip = relationship("Trip", back_populates="documents")
    reservation = relationship("Reservation", back_populates="documents")
    user = relationship("User", back_populates="documents")


# -------------------------------------------------------------
# Finances & Budgets (RF16, RF17, RF18)
# -------------------------------------------------------------
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id", ondelete="SET NULL"), nullable=True)
    paid_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False) # passagens, hospedagem, alimentacao, transporte, passeios, compras, seguro_viagem, documentacao, outras
    amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    date = Column(Date, nullable=False)
    payment_status = Column(String(20), default="pago") # pago, pendente
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    trip = relationship("Trip", back_populates="expenses")
    reservation = relationship("Reservation", back_populates="expenses")
    paid_by = relationship("User")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")


class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    participant_name = Column(String(150), nullable=False)
    split_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    is_settled = Column(Boolean, default=False)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")


class BudgetCategory(Base):
    __tablename__ = "budget_categories"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    budgeted_amount = Column(Numeric(10, 2), nullable=False, default=0.00)

    trip = relationship("Trip", back_populates="budgets")


# -------------------------------------------------------------
# Checklists & Luggage (RF27, RF28)
# -------------------------------------------------------------
class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), default="geral")
    priority = Column(String(20), default="media") # baixa, media, alta
    due_date = Column(Date, nullable=True)
    is_completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    trip = relationship("Trip", back_populates="checklists")
    assigned_to = relationship("User")


class LuggageItem(Base):
    __tablename__ = "luggage_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String(200), nullable=False)
    category = Column(String(50), default="roupas") # roupas, higiene, eletronicos, medicamentos, acessorios, outros
    quantity = Column(Integer, default=1)
    is_packed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)

    trip = relationship("Trip", back_populates="luggage_items")
    user = relationship("User", back_populates="luggage_items")


# -------------------------------------------------------------
# Emergency Contacts & Google Photos (RF29, RF32)
# -------------------------------------------------------------
class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=False)
    relationship_label = Column(String(100), nullable=True) # pai, mae, amigo, medico, etc.
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    family = relationship("FamilyGroup")
    user = relationship("User", back_populates="emergency_contacts")


class GooglePhotoAlbum(Base):
    __tablename__ = "google_photo_albums"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    album_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    trip = relationship("Trip", back_populates="photo_albums")


# -------------------------------------------------------------
# Notifications & Audit Log (RF33, RF41)
# -------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info") # info, reminder, alert
    is_read = Column(Boolean, default=False)
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False) # create, update, delete
    entity_type = Column(String(50), nullable=False) # trip, reservation, expense, document, activity, etc.
    entity_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)

    family = relationship("FamilyGroup", back_populates="audit_logs")
    user = relationship("User")

