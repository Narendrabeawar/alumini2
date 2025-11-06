"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Eye } from "lucide-react";
import Link from "next/link";

type Alumni = {
  id: string;
  name: string;
  email: string;
  gradYear: number | null;
  department: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  location: string | null;
};

const columns: ColumnDef<Alumni>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="text-zinc-600">{email || "—"}</div>;
    },
  },
  {
    accessorKey: "gradYear",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Graduation Year
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const year = row.getValue("gradYear") as number | null;
      return <div>{year || "—"}</div>;
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const dept = row.getValue("department") as string | null;
      return <div>{dept || "—"}</div>;
    },
  },
  {
    accessorKey: "currentCompany",
    header: "Company",
    cell: ({ row }) => {
      const company = row.getValue("currentCompany") as string | null;
      return <div className="font-medium">{company || "—"}</div>;
    },
  },
  {
    accessorKey: "currentTitle",
    header: "Title",
    cell: ({ row }) => {
      const title = row.getValue("currentTitle") as string | null;
      return <div>{title || "—"}</div>;
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const location = row.getValue("location") as string | null;
      return <div className="text-zinc-600">{location || "—"}</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const alumni = row.original;
      return (
        <Link href={`/alumni/${alumni.id}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            See Details
          </Button>
        </Link>
      );
    },
  },
];

export default function AlumniListTable({ initialData }: { initialData: Alumni[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!globalFilter) return initialData;

    const searchLower = globalFilter.toLowerCase();
    return initialData.filter((alumni) => {
      const name = alumni.name?.toLowerCase() || "";
      const department = alumni.department?.toLowerCase() || "";
      const company = alumni.currentCompany?.toLowerCase() || "";
      const title = alumni.currentTitle?.toLowerCase() || "";
      const location = alumni.location?.toLowerCase() || "";
      const gradYear = alumni.gradYear?.toString() || "";

      return (
        name.includes(searchLower) ||
        department.includes(searchLower) ||
        company.includes(searchLower) ||
        title.includes(searchLower) ||
        location.includes(searchLower) ||
        gradYear.includes(searchLower)
      );
    });
  }, [initialData, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, department, company, title, location, or graduation year..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        {globalFilter && (
          <p className="text-sm text-zinc-600 mt-2">
            Found {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No alumni found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-zinc-600">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredData.length
            )}{" "}
            of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

