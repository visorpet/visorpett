export type AppointmentStatus =
  | "agendado"
  | "confirmado"
  | "em_atendimento"
  | "concluido"
  | "cancelado"
  | "faltou";

export type ServiceType =
  | "banho"
  | "tosa"
  | "banho_e_tosa"
  | "consulta"
  | "veterinario"
  | "hotel"
  | "creche"
  | "outro";

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  petPhotoUrl?: string;
  petSpecies?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  petShopId: string;
  groomerId?: string;
  groomerName?: string;
  serviceType: ServiceType;
  serviceLabel: string;
  price: number;
  date: string;       // ISO date
  time: string;       // "HH:mm"
  durationMin: number;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;       // "HH:mm"
  available: boolean;
  appointmentId?: string;
}

export interface Service {
  id: string;
  label: string;
  description?: string;
  priceFrom: number;
  priceTo?: number;
  durationMin: number;
  icon: string;       // Material Symbol name
  type: ServiceType;
}
