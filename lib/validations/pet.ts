import { z } from "zod";

export const petSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  species: z.string().min(1, "Selecione a espécie"),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
  photoUrl: z.string().url().optional(),
  clientId: z.string().uuid("Cliente inválido").optional(),
});

export const updatePetSchema = petSchema.partial();
