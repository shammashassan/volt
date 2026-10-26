import type { Metadata } from "next";
import { PendingApprovalContent } from "@/components/auth/pending-approval-content";

export const metadata: Metadata = {
  title: "Approval Pending",
  description: "Your account is awaiting administrator approval before accessing the workspace.",
};

export default function PendingApprovalPage() {
  return <PendingApprovalContent />;
}
