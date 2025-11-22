"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function ClientReviewResultPage() {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get("reviewId");

  const [review, setReview] = useState<any>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!reviewId) return;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/clients/${reviewId}`
        );
        const data = await res.json();
        setReview(data);
      } catch (e: any) {
        toast.error(e.message);
      }
    })();
  }, [reviewId]);

  const current = review?.clients?.[index];

  const exportSingle = () => {
    if (!current?.analytics) return;
    const doc = new jsPDF();
    doc.text(`Client Review`, 10, 10);
    doc.text(`Client ID: ${current.clientId}`, 10, 20);
    doc.text(
      `Period: ${new Date(
        review.periodStart
      ).toLocaleDateString()} - ${new Date(
        review.periodEnd
      ).toLocaleDateString()}`,
      10,
      30
    );

    let y = 40;
    Object.entries(current.analytics).forEach(([k, v]) => {
      doc.text(`${k}: ${JSON.stringify(v)}`, 10, y);
      y += 8;
    });

    doc.save(`client-review-${current.clientId}.pdf`);
  };

  const exportAll = () => {
    if (!review?.clients?.length) return;
    const doc = new jsPDF();

    review.clients.forEach((client: any, i: number) => {
      doc.text(`Client Review`, 10, 10);
      doc.text(`Client ID: ${client.clientId}`, 10, 20);
      doc.text(
        `Period: ${new Date(
          review.periodStart
        ).toLocaleDateString()} - ${new Date(
          review.periodEnd
        ).toLocaleDateString()}`,
        10,
        30
      );

      let y = 40;
      if (!client.analytics) {
        doc.text("No data for this period.", 10, y);
      } else {
        Object.entries(client.analytics).forEach(([k, v]) => {
          doc.text(`${k}: ${JSON.stringify(v)}`, 10, y);
          y += 8;
        });
      }

      if (i < review.clients.length - 1) doc.addPage();
    });

    doc.save(`client-review-all.pdf`);
  };

  if (!review) return <div className="p-6">Loading review…</div>;

  return (
    <ProtectedRoute allowedRoles={["AGENCY_ADMIN"]}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Client Review Results</h1>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            disabled={index === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>

          <div className="text-sm text-muted-foreground">
            Client {index + 1} of {review.clients.length}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setIndex((i) => Math.min(i + 1, review.clients.length - 1))
            }
            disabled={index >= review.clients.length - 1}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <Card className="p-4 space-y-2">
          {!current?.analytics ? (
            <p className="text-sm text-red-600">
              No data found for this client during this period.
            </p>
          ) : (
            <>
              <p>Total Hours: {current.analytics.totalHours}</p>
              <p>Total Visits: {current.analytics.totalVisits}</p>
              <p>
                Exceptions: {current.analytics.totalExceptions} (
                {current.analytics.percentVisitsWithException}% visits)
              </p>
              <p>
                GPS Exceptions: {current.analytics.gpsExceptionCount} (
                {current.analytics.percentVisitsWithGpsException}% visits)
              </p>

              {/* Add more UI blocks later, data already available */}
            </>
          )}
        </Card>

        <div className="flex gap-2">
          <Button onClick={exportSingle} disabled={!current?.analytics}>
            <Download className="w-4 h-4 mr-1" /> Export PDF
          </Button>
          <Button variant="outline" onClick={exportAll}>
            <Download className="w-4 h-4 mr-1" /> Export ALL PDFs
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
