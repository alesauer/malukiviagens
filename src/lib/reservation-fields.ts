type ReservationFields = {
  title: string;
  placeholder: string;
  provider: string | null;
  code: string | null;
  start: string;
  end: string | null;
  address: string | null;
};

export const RESERVATION_FIELDS = {
  hospedagem: { title: "Hospedagem", placeholder: "Ex.: Pousada Vila do Mar", provider: null, code: null, start: "Check-in", end: "Check-out", address: "Endereço da hospedagem" },
  voo: { title: "Voo / trecho", placeholder: "Ex.: São Paulo → Recife · LA 3456", provider: "Companhia aérea", code: "Localizador", start: "Partida", end: "Chegada", address: null },
  onibus: { title: "Trecho", placeholder: "Ex.: São Paulo → Curitiba", provider: "Empresa de transporte", code: "Código do bilhete", start: "Embarque", end: "Chegada", address: "Local de embarque" },
  carro: { title: "Veículo", placeholder: "Ex.: SUV compacto", provider: "Locadora", code: "Número da reserva", start: "Retirada", end: "Devolução", address: "Local de retirada" },
  restaurante: { title: "Restaurante", placeholder: "Ex.: Restaurante Maré", provider: null, code: null, start: "Data e horário", end: null, address: "Endereço do restaurante" },
  ingresso: { title: "Evento / atração", placeholder: "Ex.: Parque aquático", provider: null, code: "Código do ingresso", start: "Data e horário", end: null, address: "Local do evento / atração" },
  seguro: { title: "Seguro / plano", placeholder: "Ex.: Seguro familiar internacional", provider: "Seguradora", code: "Número da apólice", start: "Início da cobertura", end: "Fim da cobertura", address: null },
} satisfies Record<string, ReservationFields>;

export function reservationFields(kind: string): ReservationFields {
  return (RESERVATION_FIELDS as Record<string, ReservationFields>)[kind] ?? RESERVATION_FIELDS.hospedagem;
}

export function itineraryReservations<T extends { kind: string }>(reservations: T[]): T[] {
  return reservations.filter((reservation) => reservation.kind !== "seguro");
}

// Discard values from fields that are no longer applicable after changing type.
export function applicableReservationValues<T extends { provider: string; confirmation_code: string; ends_at: string; address: string; maps_url: string }>(kind: string, values: T): T {
  const fields = reservationFields(kind);
  return {
    ...values,
    provider: fields.provider ? values.provider : "",
    confirmation_code: fields.code ? values.confirmation_code : "",
    ends_at: fields.end ? values.ends_at : "",
    address: fields.address ? values.address : "",
    maps_url: fields.address ? values.maps_url : "",
  };
}