import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().min(10, "Telefone inválido"),
  petShopId: z.string().cuid("Pet shop inválido"),
});
