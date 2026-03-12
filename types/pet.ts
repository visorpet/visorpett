export type PetSpecies = "cachorro" | "gato" | "coelho" | "pássaro" | "outro";

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: string;
  weight?: number; // kg
  photoUrl?: string;
  ownerId: string;
  // Prontuário resumido
  lastGrooming?: string; // ISO date
  lastBath?: string;     // ISO date
  daysSinceLastBath?: number;
  vaccines?: Vaccine[];
  medicalHistory?: MedicalRecord[];
}

export interface Vaccine {
  id: string;
  name: string;
  date: string;        // ISO date
  nextDueDate?: string;
  appliedBy?: string;
  status: "em_dia" | "vencida" | "próxima";
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: "consulta" | "cirurgia" | "exame" | "outro";
  description: string;
  veterinarian?: string;
  attachments?: string[];
}
