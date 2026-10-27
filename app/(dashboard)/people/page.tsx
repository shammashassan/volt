import { getPeople } from "@/lib/queries/people";
import { PeopleContent } from "@/components/people/people-content";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "People",
  description: "Manage your professional directory, mentors, creators, and contacts.",
}

export default async function PeoplePage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect("/login")
  }
  const userId = session.user.id
  const people = await getPeople(userId)
  
  return <PeopleContent initialPeople={people} />
}
