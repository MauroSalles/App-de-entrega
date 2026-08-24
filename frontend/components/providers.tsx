"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { User } from "@/lib/types";
import { useAuthStore } from "@/store/auth";

function SessionBootstrap() {
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useQuery({
    queryKey: ["session", token],
    queryFn: async () => {
      const response = await api.get<User>("/auth/me");
      return response.data;
    },
    enabled: hydrated && !!token,
    retry: false,
    staleTime: 60_000,
    onSuccess: (user) => setUser(user),
    onError: () => logout()
  });

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap />
      {children}
    </QueryClientProvider>
  );
}
