import { z } from "zod";

export const appointmentSchema = z.object({
  petId: z.string().cuid("Pet inválido"),
  petShopId: z.string().cuid("Pet shop inválido"),
  serviceId: z.string().cuid("Serviço inválido"),
  groomerId: z.string().cuid().optional(),
  date: z.string().datetime({ message: "Data e hora inválidas" }),
  notes: z.string().max(500, "Observações com no máximo 500 caracteres").optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["agendado", "confirmado", "em_atendimento", "concluido", "cancelado", "faltou"]),
});
