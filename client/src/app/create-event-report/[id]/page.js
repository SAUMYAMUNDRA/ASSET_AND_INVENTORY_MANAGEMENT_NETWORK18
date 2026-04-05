"use client";

import { useParams } from "next/navigation";
import EventReportPage from "../page";

export default function EventPageWrapper() {
  const params = useParams(); // gets URL params
  const eventId = params.id; // [id] from /events/[id]

  return <EventReportPage eventid={eventId} isreviewing={true} />;
}