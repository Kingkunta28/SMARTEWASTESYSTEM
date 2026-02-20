import { useEffect, useState } from "react";
import { api } from "../api";
import StatusBadge from "../components/StatusBadge";

export default function AdminDashboard({ requests, refresh }) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [collectors, setCollectors] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCollectors, setSelectedCollectors] = useState({});
  const [reportMonth, setReportMonth] = useState(currentMonth);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([api.listCollectors(), api.dashboardStats()])
      .then(([collectorData, statData]) => {
        setCollectors(collectorData);
        setStats(statData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const assign = async (requestId, collectorId) => {
    if (!collectorId) return;
    setError("");
    setSuccess("");
    try {
      await api.assignCollector(requestId, Number(collectorId));
      await refresh();
      setSuccess(`Request #${requestId} assigned successfully.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const setStatus = async (requestId, status) => {
    setError("");
    setSuccess("");
    try {
      await api.updateStatus(requestId, status);
      await refresh();
      setSuccess(`Request #${requestId} marked as ${status}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const setCollectorSelection = (requestId, collectorId) => {
    setSelectedCollectors((prev) => ({ ...prev, [requestId]: collectorId }));
  };

  const exportMonthlyReport = async () => {
    setError("");
    setSuccess("");
    try {
      const pdfBlob = await api.exportMonthlyReportPdf(reportMonth);
      const objectUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `monthly_collection_${reportMonth}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setSuccess("Monthly PDF report downloaded.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="role-panel role-admin">
      <div className="panel-hero admin-hero card">
        <div>
          <p className="panel-kicker">Operations Center</p>
          <h2>Admin Dashboard</h2>
          <p>Monitor incoming pickups, assign collectors, and close completed requests quickly.</p>
        </div>
        <div className="report-controls">
          <label>
            Report Month
            <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
          </label>
          <button type="button" onClick={exportMonthlyReport}>
            Export Monthly PDF
          </button>
        </div>
      </div>
      {stats ? (
        <div className="stats">
          <div className="stat">
            <strong>{stats.total_requests}</strong>
            <span>Total</span>
          </div>
          <div className="stat">
            <strong>{stats.pending_requests}</strong>
            <span>Pending</span>
          </div>
          <div className="stat">
            <strong>{stats.assigned_requests}</strong>
            <span>Assigned</span>
          </div>
          <div className="stat">
            <strong>{stats.completed_requests}</strong>
            <span>Completed</span>
          </div>
        </div>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
      {success ? <p className="success">{success}</p> : null}

      <div className="card table-shell">
        <div className="section-head">
          <h3>Manage Requests</h3>
          <p>Assign a collector and update statuses from one control table.</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Item</th>
              <th>Status</th>
              <th>Collector</th>
              <th>Assign</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.user.username}</td>
                <td>{req.item_type}</td>
                <td>
                  <StatusBadge status={req.status} />
                </td>
                <td>{req.assigned_collector?.username || "-"}</td>
                <td>
                  <select
                    value={selectedCollectors[req.id] || ""}
                    onChange={(e) => setCollectorSelection(req.id, e.target.value)}
                  >
                    <option value="">Select</option>
                    {collectors.map((collector) => (
                      <option key={collector.id} value={collector.id}>
                        {collector.username}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      onClick={() => assign(req.id, selectedCollectors[req.id])}
                      disabled={!selectedCollectors[req.id]}
                    >
                      Assign
                    </button>
                    <button type="button" onClick={() => setStatus(req.id, "completed")}>
                      Complete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
