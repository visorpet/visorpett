export type PlanType = "free" | "pro" | "premium" | "enterprise";

export interface PetShop {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    cep: string;
  };
  phone?: string;
  whatsapp?: string;
  email?: string;
  ownerId: string;
  plan: PlanType;
  planExpiresAt?: string;
  isActive: boolean;
  createdAt: string;
  // Métricas resumidas
  monthlyRevenue?: number;
  todayAppointments?: number;
  activeClients?: number;
}

export interface DashboardMetrics {
  todayAppointments: number;
  todayAppointmentsDelta?: number;
  monthlyRevenue: number;
  monthlyRevenueDelta?: number;
  inService: number;
  toReactivate: number;   // clientes sem banho há mais de X dias
}

export interface ChartData {
  label: string;          // ex: "Seg", "Ter"
  value: number;
  isHighlight?: boolean;
  isCurrent?: boolean;
}
