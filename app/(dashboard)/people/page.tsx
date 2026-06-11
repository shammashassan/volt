import { getPeople } from "@/lib/db"
import { PeopleContent } from "./people-content"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"


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
