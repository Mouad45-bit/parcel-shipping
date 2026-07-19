import type { Metadata } from "next";
import { requireCurrentUser } from "@/features/auth/server/auth-session";
import { PodPrintDocument } from "@/features/shipments/components/PodPrintDocument";

export const metadata: Metadata = {
  title: "Print POD | Parcel Shipping",
  description: "Printable proof of delivery document.",
};

type PrintPageProps = {
  params: Promise<{
    shipmentId: string;
  }>;
};

export default async function PrintPage({
  params,
}: PrintPageProps) {
  await requireCurrentUser();

  const { shipmentId } = await params;

  return <PodPrintDocument shipmentId={shipmentId} />;
}
