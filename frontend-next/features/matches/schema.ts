// features/matches/schema.ts

export interface Match {
  _id: string;

  supplierId: {
    _id: string;
    nombreEmpresa: string;
    logoEmpresa?: string;
    sector: string;
  };

  buyerId: {
    _id: string;
    nombreEmpresa: string;
    logoEmpresa?: string;
    sector: string;
  };

  score: number;

  status:
    | "pending"
    | "accepted"
    | "rejected";

  notes?: string;

  createdAt: string;
}