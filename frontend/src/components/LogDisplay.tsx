"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronUp, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Log = {
  website: string;
  timestamp: string;
  responseTime: number;
  statusCode: number;
};

type LogDisplayProps = {
  logs: Array<Log>;
};

export function LogDisplay({ logs }: LogDisplayProps) {
  // Remove duplicates by creating a Set based on unique keys
  const limitedLogs = useMemo(() => {
    const uniqueLogs = new Map();
    logs.slice(-100).forEach((log) => {
      const key = `${log.timestamp}-${log.website}`;
      uniqueLogs.set(key, log);
    });
    return Array.from(uniqueLogs.values());
  }, [logs]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const filteredAndSortedLogs = useMemo(() => {
    return limitedLogs
      .filter((log) => {
        const matchesSearch =
          log.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.statusCode.toString().includes(searchQuery) ||
          log.responseTime.toString().includes(searchQuery);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "success" &&
            log.statusCode >= 200 &&
            log.statusCode < 300) ||
          (statusFilter === "error" &&
            (log.statusCode < 200 || log.statusCode >= 300));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [limitedLogs, searchQuery, statusFilter, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedLogs.length / logsPerPage);
  const paginatedLogs = filteredAndSortedLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const renderPagination = () => {
    const paginationItems = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        paginationItems.push(
          <PaginationItem key={i} className="hover:cursor-pointer">
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (
        i === currentPage - 2 ||
        i === currentPage + 2 ||
        paginationItems[paginationItems.length - 1]?.props.children !== "..."
      ) {
        paginationItems.push(
          <PaginationItem key={`dots-${i}`} className="hover:cursor-pointer">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }
    return paginationItems;
  };

  return (
    <Card>
      <CardHeader></CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status Codes</SelectItem>
                <SelectItem value="success">Success (2xx)</SelectItem>
                <SelectItem value="error">Error (non-2xx)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() =>
                      setSortDirection((d) => (d === "asc" ? "desc" : "asc"))
                    }
                  >
                    Time
                    {sortDirection === "desc" ? (
                      <ChevronDown className="ml-2 inline h-4 w-4" />
                    ) : (
                      <ChevronUp className="ml-2 inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Status Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log, index) => (
                  <TableRow key={`${log.timestamp}-${index}`}>
                    <TableCell className="font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.website}</TableCell>
                    <TableCell>{log.responseTime}ms</TableCell>
                    <TableCell>
                      <span
                        className={
                          log.statusCode >= 200 && log.statusCode < 300
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {log.statusCode}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="select-none cursor-pointer"
                  />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    className="select-none cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
