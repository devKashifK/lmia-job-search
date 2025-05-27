"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import db from "@/db";
import { useQuery } from "@tanstack/react-query";
import DynamicDataView from "@/components/ui/dynamic-data-view";
import { useTableStore } from "@/context/store";
import { LMIA } from "@/components/filters/column-def";

interface SupabaseResponse {
  data: LMIA[];
  error: Error | null;
  count: number | null;
}

interface FilterObject {
  [key: string]: string | string[];
}

export default function CompanyPage() {
  const params = useParams();
  const keyword = params?.keyword as string;
  const [page, setPage] = useState(1);
  const pageSize = 60;
  const { dataConfig } = useTableStore();
  const type = dataConfig?.type || "hotLeads";
  const { data, error, isLoading } = useData();

  if (!keyword) {
    return <div>No keyword found</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <DynamicDataView
      title={decodeURIComponent(keyword)}
      type={type}
      data={data}
      isLoading={isLoading}
      onPageChange={setPage}
      currentPage={page}
      pageSize={pageSize}
    />
  );
}

const useData = () => {
  const { dataConfig } = useTableStore();
  const {
    table,
    method,
    columns: filterJsonString,
    type,
    page,
    pageSize,
  } = dataConfig || {};

  const isQueryEnabled =
    method === "query" && typeof table === "string" && table.trim() !== "";
  const selectProjection =
    type == "lmia" ? selectProjectionLMIA : selectProjectionHotLeads;

  let parsedFilterArray: FilterObject[] = [];

  if (
    isQueryEnabled &&
    typeof filterJsonString === "string" &&
    filterJsonString.trim() !== ""
  ) {
    try {
      const parsed = JSON.parse(filterJsonString);
      if (Array.isArray(parsed)) {
        parsedFilterArray = parsed;
      }
    } catch (e) {
      console.error(
        "Failed to parse dataConfig.columns (filterJsonString):",
        e
      );
    }
  } else if (isQueryEnabled && Array.isArray(filterJsonString)) {
    parsedFilterArray = filterJsonString;
  }

  const stableFiltersKeyPart = JSON.stringify(parsedFilterArray);

  return useQuery<SupabaseResponse, Error>({
    queryKey: [
      "tableData",
      table,
      type,
      selectProjection,
      stableFiltersKeyPart,
      page,
      pageSize,
    ],
    queryFn: async () => {
      let query = db
        .from(table)
        .select(selectProjection || "*", { count: "exact" });

      parsedFilterArray.forEach((filterObject) => {
        if (typeof filterObject === "object" && filterObject !== null) {
          for (const key in filterObject) {
            if (Object.prototype.hasOwnProperty.call(filterObject, key)) {
              const value = filterObject[key];
              if (Array.isArray(value)) {
                query = query.in(key, value);
              } else {
                query = query.eq(key, value);
              }
            }
          }
        }
      });

      const currentPage = typeof page === "number" && page > 0 ? page : 1;
      const currentPSize =
        typeof pageSize === "number" && pageSize > 0 ? pageSize : 10;
      const from = (currentPage - 1) * currentPSize;
      const to = from + currentPSize - 1;

      query = query.range(from, to);
      const { data, error, count } = await query;

      if (error) {
        throw new Error(
          error.message ||
            `Failed to fetch data from Supabase table "${table}".`
        );
      }

      // Ensure the data matches our LMIA type
      const typedData = (data || []) as unknown as LMIA[];

      return { data: typedData, error: null, count: count || 0 };
    },
    enabled: isQueryEnabled,
  });
};

const selectProjectionLMIA =
  "territory, program, city, lmia_year, job_title, noc_code, priority_occupation, approved_positions, operating_name";
const selectProjectionHotLeads =
  "state, city, date_of_job_posting, noc_code, noc_priority, job_title, operating_name, year, occupation_title, job_status, employer_type, 2021_noc";
