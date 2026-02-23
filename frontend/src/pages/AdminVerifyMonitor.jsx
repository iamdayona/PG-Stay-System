import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, XCircle, Eye, Trash2 } from "lucide-react";
import RoleNavigation from "../context/RoleNavigation";
import {
  apiAdminGetPGs,
  apiAdminVerifyPG,
  apiAdminRestrictPG,
  apiAdminDeletePG,
  apiAdminStats,
} from "../utils/api";

export default function AdminVerifyMonitor() {
  const [pgListings, setPgListings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchData = async () => {
    try {
      const [pgsRes, statsRes] = await Promise.all([
        apiAdminGetPGs(),
        apiAdminStats(),
      ]);
      setPgListings(pgsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleVerify = async (id) => {
    setActionLoading(id + "verify");
    try {
      await apiAdminVerifyPG(id);
      await fetchData();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  const handleRestrict = async (id) => {
    setActionLoading(id + "restrict");
    try {
      await apiAdminRestrictPG(id);
      await fetchData();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this PG Stay?")) return;
    setActionLoading(id + "delete");
    try {
      await apiAdminDeletePG(id);
      await fetchData();
    } catch (err) { alert(err.message); }
    finally { setActionLoading(""); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-8 text-gray-800">Admin Verification & Management</h2>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "PG Stays Listed",       value: stats.totalPGs,             color: "text-blue-600" },
            { label: "Verified PG Stays",      value: pgListings.filter(p => p.verificationStatus === "verified").length, color: "text-green-600" },
            { label: "Pending Verification",   value: stats.pendingVerifications, color: "text-yellow-600" },
            { label: "Active Bookings",        value: stats.activeBookings,       color: "text-red-600" },
          ].map((c, i) => (
            <Card key={i} className="p-6 bg-white border border-gray-300 text-center">
              <p className={`text-3xl ${c.color} mb-2`}>{loading ? "..." : (c.value ?? 0)}</p>
              <p className="text-sm text-gray-600">{c.label}</p>
            </Card>
          ))}
        </div>

        {/* PG Table */}
        <Card className="p-6 bg-white border border-gray-300 mb-6">
          <h3 className="text-lg mb-6 text-gray-800">PG Verification and Management</h3>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4">PG Name</th>
                    <th className="text-left py-3 px-4">Owner</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Trust Score</th>
                    <th className="text-left py-3 px-4">Complaints</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pgListings.map((pg) => (
                    <tr key={pg._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">{pg.name}</td>
                      <td className="py-3 px-4">{pg.owner?.name}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-sm ${
                          pg.verificationStatus === "verified"   ? "bg-green-100 text-green-700"  :
                          pg.verificationStatus === "pending"    ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {pg.verificationStatus.charAt(0).toUpperCase() + pg.verificationStatus.slice(1)}
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${pg.trustScore >= 85 ? "text-green-600" : pg.trustScore >= 75 ? "text-yellow-600" : "text-red-600"}`}>
                        {pg.trustScore}/100
                      </td>
                      <td className={`py-3 px-4 ${pg.complaints > 0 ? "text-red-600" : "text-gray-600"}`}>
                        {pg.complaints}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {pg.verificationStatus === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleVerify(pg._id)}
                                disabled={actionLoading === pg._id + "verify"}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRestrict(pg._id)}
                                disabled={actionLoading === pg._id + "restrict"}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {pg.verificationStatus === "verified" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleRestrict(pg._id)}
                              disabled={actionLoading === pg._id + "restrict"}
                            >
                              Restrict
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(pg._id)}
                            disabled={actionLoading === pg._id + "delete"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}