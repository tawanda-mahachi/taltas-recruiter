import { create } from 'zustand';

export interface CreatedRole {
  id: string; title: string; department: string; location: string; salary: string;
  urgency: 'HOT' | 'WARM' | 'NORMAL'; atsSource: string; candidateCount: number;
}

export interface CreatedExplorer {
  id: string; name: string; mode: 'AUTO' | 'ASSIST' | 'DRAFT'; role: string;
  icon: string; iconBg: string; conversations: number; a2aSessions: number;
  interviewsSet: number; blobVariant: number;
  interactions: Array<{ name: string; avatar: string; via: string; sentiment: string; sentimentColor: string }>;
}

interface PlatformStore {
  createdRoles: CreatedRole[];
  createdExplorers: CreatedExplorer[];
  addRole: (r: CreatedRole) => void;
  addExplorer: (e: CreatedExplorer) => void;
}

export const usePlatformStore = create<PlatformStore>((set) => ({
  createdRoles: [],
  createdExplorers: [],
  addRole: (r) => set((s) => ({ createdRoles: [...s.createdRoles, r] })),
  addExplorer: (e) => set((s) => ({ createdExplorers: [...s.createdExplorers, e] })),
}));
