"use client";
import React from "react";
import { useParams } from "next/navigation";
import DynamicDataView from "@/components/ui/dynamic-data-view";

export default function RolesPage() {
  const params = useParams();
  const keyword = params?.keyword as string;

  if (!keyword) {
    return <div>No keyword found</div>;
  }

  return (
    <DynamicDataView
      title={decodeURIComponent(keyword)}
      field="job_title"
    />
  );
}
