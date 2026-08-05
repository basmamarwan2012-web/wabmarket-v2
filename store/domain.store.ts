import { create } from "zustand";

import { Domain } from "@/types";

interface DomainStore {
  domains: Domain[];

  setDomains: (domains: Domain[]) => void;

  addDomain: (domain: Domain) => void;
}

export const useDomainStore = create<DomainStore>(
  (set) => ({
    domains: [],

    setDomains: (domains) =>
      set(() => ({
        domains,
      })),

    addDomain: (domain) =>
      set((state) => ({
        domains: [...state.domains, domain],
      })),
  }),
);