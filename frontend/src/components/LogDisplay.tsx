"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWebsiteLogs } from "@/contexts/WebSocketContext";
import { useState } from "react";

type LogDisplayProps = {
  projectId: string;
};

export function LogDisplay({ projectId }: LogDisplayProps) {
  const logs = useWebsiteLogs(projectId);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  const reversedLogs = [...logs].reverse();

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = reversedLogs.slice(indexOfFirstLog, indexOfLastLog);

  const totalPages = Math.ceil(reversedLogs.length / logsPerPage);

  return (
    <div className="space-y-4">
      <div className="h-[300px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Response Time</TableHead>
              <TableHead>Status Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.map((log, index) => (
              <TableRow key={log.timestamp}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.website}</TableCell>
                <TableCell>{log.responseTime}ms</TableCell>
                <TableCell>{log.statusCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              //   disabled={currentPage === 1}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                onClick={() => setCurrentPage(index + 1)}
                isActive={currentPage === index + 1}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              //   disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
