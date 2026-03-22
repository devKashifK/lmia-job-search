"use client";
import React from "react";
import DynamicDataView from "@/components/ui/dynamic-data-view";

export default function RolesClient({ keyword }: { keyword: string }) {
  return (
    <DynamicDataView
      title={decodeURIComponent(keyword)}
      field="job_title"
    />
  );
}
