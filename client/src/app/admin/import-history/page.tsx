'use client'
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

type ImportLog = {
  importDate: string;
  totalFetched: number;
  newRecords: number;
  updatedRecords: number;
  failedRecords: number;
  failures: { jobId: string; reason: string }[];
};

const backendURL = "http://localhost:5000";
const socket = io(backendURL);

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    async function fetchLogs() {
      try {
        const res = await axios.get(`${backendURL}/api/import-logs?page=${page}`);
        setLogs(res.data.logs);
        setTotalPages(res.data.pages);
      } catch (error) {
        setLogs([]);
      }
      setLoading(false);
    }
    fetchLogs();
  }, [page]);

  useEffect(() => {
    socket.on("jobProgress", () => {
      setPage(1);
    });
    return () => {
      socket.off("jobProgress");
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl py-12 px-2">
      <h1 className="text-4xl font-extrabold mb-8 text-300 drop-shadow text-center">Import History</h1>
      <div className="bg-gray-900 rounded-xl shadow-lg overflow-x-auto pb-4">
        <table className="w-full text-sm text-gray-200">
          <thead className="sticky top-0 bg-gray-800 text-200">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">New</th>
              <th className="p-3">Updated</th>
              <th className="p-3">Failed</th>
              <th className="p-3 text-left">Failure Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-cyan-300">Loading…</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-cyan-300">No import history found.</td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-800/60">
                  <td className="p-3 whitespace-nowrap">{new Date(log.importDate).toLocaleString()}</td>
                  <td className="p-3 text-center">{log.totalFetched}</td>
                  <td className="p-3 text-center text-green-400">{log.newRecords}</td>
                  <td className="p-3 text-center text-blue-200">{log.updatedRecords}</td>
                  <td className="p-3 text-center text-red-400">{log.failedRecords}</td>
                  <td className="p-3">
                    {log.failures.length === 0 ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <ul className="list-disc ml-4">
                        {log.failures.map((f, i) => (
                          <li key={i} className="break-all">
                            <span className="font-semibold">{f.jobId}:</span> {f.reason}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-8 px-2">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-cyan-700 px-4 py-2 rounded text-white font-semibold disabled:bg-gray-600"
        >
          Previous
        </button>
        <span className="text-lg font-medium text-cyan-800">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="bg-amber-600 px-4 py-2 rounded text-white font-semibold disabled:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}