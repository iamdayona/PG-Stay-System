import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import RoleNavigation from "../context/RoleNavigation";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { apiAdminTrustScores, apiAdminSuspendUser } from "../utils/api";

export default function AdminMonitorTrustScores() {
  const [data, setData] = useState({ pgs: [], users: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await apiAdminTrustScores();
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSuspend = async (userId) => {
    if (!window.confirm("Suspend this user?")) return;
    try {
      await apiAdminSuspendUser(userId);
      await fetchData();
    } catch (err) { alert(err.message); }
  };

  const trustBadge = (score) => {
    if (score >= 80) return <Badge variant="success" className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" />High Trust</Badge>;
    if (score >= 60) return <Badge variant="warning" className="flex items-center gap-1"><ShieldAlert className="w-4 h-4" />Medium Trust</Badge>;
    return <Badge variant="danger" className="flex items-center gap-1"><ShieldX className="w-4 h-4" />Low Trust</Badge>;
  };

  const allItems = [
    ...data.pgs.map((p) => ({ name: p.name, type: "PG", owner: p.owner?.name || "-", score: p.trustScore, _id: p._id, isUser: false })),
    ...data.users.map((u) => ({ name: u.name, type: u.role, owner: "-", score: u.trustScore, _id: u._id, isUser: true })),
  ];

  const high   = allItems.filter((i) => i.score >= 80).length;
  const medium = allItems.filter((i) => i.score >= 60 && i.score < 80).length;
  const low    = allItems.filter((i) => i.score < 60).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleNavigation role="admin" />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl mb-6 text-gray-800">Monitor Trust Scores</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-5 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">High Trust</p>
            <p className="text-2xl font-semibold text-green-600">{loading ? "..." : high}</p>
          </Card>
          <Card className="p-5 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Medium Trust</p>
            <p className="text-2xl font-semibold text-yellow-600">{loading ? "..." : medium}</p>
          </Card>
          <Card className="p-5 bg-white border border-gray-300">
            <p className="text-sm text-gray-600">Low Trust</p>
            <p className="text-2xl font-semibold text-red-600">{loading ? "..." : low}</p>
          </Card>
        </div>

        <Card className="p-6 bg-white border border-gray-300">
          <h3 className="text-lg mb-4 text-gray-800">Trust Score Details</h3>
          {loading ? <p className="text-gray-500 text-sm">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-300">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Type</th>
                    <th className="p-3 border">Owner</th>
                    <th className="p-3 border">Trust Score</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allItems.map((item, i) => (
                    <tr key={i} className="text-center">
                      <td className="p-3 border text-left">{item.name}</td>
                      <td className="p-3 border capitalize">{item.type}</td>
                      <td className="p-3 border">{item.owner}</td>
                      <td className="p-3 border font-semibold">{item.score}/100</td>
                      <td className="p-3 border">{trustBadge(item.score)}</td>
                      <td className="p-3 border">
                        {item.isUser && item.score < 60 ? (
                          <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleSuspend(item._id)}>
                            Suspend
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
                            Warn
                          </Button>
                        )}
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