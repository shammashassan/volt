import type { Metadata } from "next";
import { LandingPageContent } from "@/components/landing/landing-page-content";

export const metadata: Metadata = {
  title: "Volt - Personal Knowledge Operating System",
  description: "Save, organize, and link resources, notes, categories, people, and media watchlists in a personal command-driven workspace.",
};

export default function Page() {
  return <LandingPageContent />;
}
