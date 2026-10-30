import { useState, useMemo } from "react";
import { Icons } from "./Icons";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns,           // [{ key, label, sortable?: boolean, render?: (row) => node }]
  data = [],         // array of items
  searchable = true,
  searchPlaceholder = "Search records…",
  searchKeys = [],   // keys to search in (defaults to all string keys)
  statusKey = "status",
  statuses = [],     // optional [{ value, label }]
  categoryKey = "categoryName",
  categories = [],   // optional list of category strings
  exportFilename = "export.csv",
  defaultSortKey,
  defaultSortDir = "desc",
  pageSize = 10,
  serverPagination = false,
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  emptyTitle = "No records found",
  emptyDesc = "Try adjusting your filters or search terms.",
  actions,           // Extra buttons in toolbar
}) {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortKey, setSortKey] = useState(defaultSortKey || (columns[0]?.key || ""));
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [clientPage, setClientPage] = useState(0);

  // Client-side filtering
  const filteredData = useMemo(() => {
    if (serverPagination) return data;

    return data.filter((item) => {
      // Status filter
      if (selectedStatus !== "ALL" && item[statusKey] !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "ALL" && item[categoryKey] !== selectedCategory) {
        return false;
      }
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const keysToTest = searchKeys.length > 0 ? searchKeys : columns.map(c => c.key);
        const match = keysToTest.some((k) => {
          const val = item[k];
          if (val == null) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!match) return false;
      }
      return true;
    });
  }, [data, search, selectedStatus, selectedCategory, searchKeys, columns, statusKey, categoryKey, serverPagination]);

  // Client-side sorting
  const sortedData = useMemo(() => {
    if (serverPagination || !sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];

      if (va == null) return sortDir === "asc" ? 1 : -1;
      if (vb == null) return sortDir === "asc" ? -1 : 1;

      // Handle numbers
      if (!isNaN(Number(va)) && !isNaN(Number(vb))) {
        va = Number(va);
        vb = Number(vb);
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }

      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDir, serverPagination]);

  // Pagination slicing
  const activePage = serverPagination ? currentPage : clientPage;
  const totalPageCount = serverPagination ? totalPages : Math.ceil(sortedData.length / pageSize) || 1;

  const paginatedData = useMemo(() => {
    if (serverPagination) return data;
    const start = activePage * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [serverPagination, data, activePage, pageSize, sortedData]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handlePageSelect = (p) => {
    if (serverPagination) {
      if (onPageChange) onPageChange(p);
    } else {
      setClientPage(p);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const dataToExport = serverPagination ? data : sortedData;
    if (!dataToExport || dataToExport.length === 0) return;

    const headers = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(",");
    const rows = dataToExport.map(item => {
      return columns.map(c => {
        let val = item[c.key];
        if (val == null) val = "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", exportFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = search.trim() !== "" || selectedStatus !== "ALL" || selectedCategory !== "ALL";

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus("ALL");
    setSelectedCategory("ALL");
    setClientPage(0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* Toolbar */}
      <div className="toolbar-row">
        {searchable && (
          <div className="search-input-wrap">
            <span className="search-icon-inside">
              <Icons.Search size={15} />
            </span>
            <input
              type="text"
              className="form-input search-input-field"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setClientPage(0);
              }}
            />
          </div>
        )}

        <div className="filters-group">
          {statuses.length > 0 && (
            <select
              className="form-select"
              style={{ width: "auto", minWidth: 130 }}
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setClientPage(0);
              }}
            >
              <option value="ALL">All Statuses</option>
              {statuses.map(s => (
                <option key={s.value || s} value={s.value || s}>
                  {s.label || s}
                </option>
              ))}
            </select>
          )}

          {categories.length > 0 && (
            <select
              className="form-select"
              style={{ width: "auto", minWidth: 140 }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setClientPage(0);
              }}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} title="Clear all filters">
              <Icons.X size={14} /> Clear
            </button>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={handleExportCSV}
            title="Export filtered records to CSV"
          >
            <Icons.Download size={14} /> Export CSV
          </button>

          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="table-clean">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable !== false ? "sortable" : ""}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      <span style={{ fontSize: 11, color: "var(--primary)" }}>
                        {sortDir === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDesc} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPageCount > 1 && (
        <div className="pagination-wrap">
          <div>
            Showing{" "}
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {paginatedData.length > 0 ? activePage * pageSize + 1 : 0}
            </span>{" "}
            to{" "}
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {Math.min((activePage + 1) * pageSize, serverPagination ? sortedData.length : sortedData.length)}
            </span>{" "}
            of{" "}
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
              {sortedData.length}
            </span>{" "}
            entries
          </div>

          <div className="pagination-controls">
            <button
              className="page-num-btn"
              disabled={activePage === 0}
              onClick={() => handlePageSelect(activePage - 1)}
              aria-label="Previous page"
            >
              <Icons.ChevronLeft size={14} />
            </button>

            {[...Array(totalPageCount)].map((_, i) => {
              // Only render near pages if count > 6
              if (totalPageCount > 6) {
                if (i !== 0 && i !== totalPageCount - 1 && Math.abs(i - activePage) > 1) {
                  if (i === activePage - 2 || i === activePage + 2) {
                    return <span key={i} style={{ padding: "0 4px", color: "var(--text-muted)" }}>…</span>;
                  }
                  return null;
                }
              }
              return (
                <button
                  key={i}
                  className={`page-num-btn ${activePage === i ? "active" : ""}`}
                  onClick={() => handlePageSelect(i)}
                >
                  {i + 1}
                </button>
              );
            })}

            <button
              className="page-num-btn"
              disabled={activePage >= totalPageCount - 1}
              onClick={() => handlePageSelect(activePage + 1)}
              aria-label="Next page"
            >
              <Icons.ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
