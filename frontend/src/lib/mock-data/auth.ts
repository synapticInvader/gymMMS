import { delay } from "@/lib/mock-data/delay";
import type { Session } from "@/lib/mock-data/types";

/** UI-only mock — mirrors the shape a future Supabase Auth session will have, but
 * does not persist anything or gate routes in this skeleton. */
const MOCK_SESSION: Session = {
  user_id: "user_owner",
  name: "Raga",
  email: "owner@mygym.example",
  role: "owner",
};

export async function login(email: string, password: string): Promise<Session> {
  void password; // not checked in this UI-only mock
  await delay(700);
  return { ...MOCK_SESSION, email };
}

export async function getSession(): Promise<Session> {
  await delay(0);
  return MOCK_SESSION;
}
