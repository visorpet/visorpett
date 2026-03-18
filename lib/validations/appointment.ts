import { z } from "zod";

export const appointmentSchema = z.object({
  petId: z.string().uuid("Pet inválido"),
  petShopId: z.string().uuid("Pet shop inválido"),
  serviceId: z.string().uuid("Serviço inválido"),
  groomerId: z.string().uuid().optional(),
  date: z.string().datetime({ message: "Data e hora inválidas" }),
  notes: z.string().max(500, "Observações com no máximo 500 caracteres").optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["agendado", "confirmado", "em_atendimento", "concluido", "cancelado", "faltou"]),
});
