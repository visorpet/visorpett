import type { Pet } from "@/types";

export const mockPets: Pet[] = [
  {
    id: "pet-001",
    name: "Thor",
    species: "cachorro",
    breed: "Golden Retriever",
    birthDate: "2020-05-10",
    weight: 28,
    ownerId: "user-client-001",
    lastBath: "2024-02-14",
    daysSinceLastBath: 29,
    vaccines: [
      {
        id: "vac-001",
        name: "V8 Polivalente",
        date: "2023-06-01",
        nextDueDate: "2024-06-01",
        status: "próxima",
      },
      {
        id: "vac-002",
        name: "Antirrábica",
        date: "2023-08-15",
        nextDueDate: "2024-08-15",
        status: "em_dia",
      },
    ],
    medicalHistory: [],
  },
  {
    id: "pet-002",
    name: "Luna",
    species: "gato",
    breed: "Siamês",
    birthDate: "2021-11-20",
    weight: 4.2,
    ownerId: "user-client-001",
    lastBath: "2024-03-01",
    daysSinceLastBath: 14,
    vaccines: [
      {
        id: "vac-003",
        name: "Tríplice Felina",
        date: "2023-09-10",
        nextDueDate: "2024-09-10",
        status: "em_dia",
      },
    ],
    medicalHistory: [],
  },
];
