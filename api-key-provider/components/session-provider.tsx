"use client";

import { createContext, useContext, ReactNode } from "react";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface SessionData {
  user: SessionUser | null;
}

const SessionContext = createContext<SessionData>({ user: null });

export function useServerSession() {
  return useContext(SessionContext);
}

export function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: SessionUser | null;
}) {
  return (
    <SessionContext.Provider value={{ user: session }}>
      {children}
    </SessionContext.Provider>
  );
}
