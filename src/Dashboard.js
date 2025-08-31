import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "https://6874ce63dd06792b9c954fc7.mockapi.io/api/v1/users"
        );
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const totalUsers = users.length;

  const usersPerDay = useMemo(() => {
    const map = {};
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      map[date.toISOString().split("T")[0]] = 0;
    }
    users.forEach((user) => {
      if (user.createdAt) {
        const key = user.createdAt.split("T")[0];
        if (map[key] !== undefined) map[key]++;
      }
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .reverse();
  }, [users]);

  const avatarData = useMemo(() => {
    const withAvatar = users.filter((u) => u.avatar).length;
    const withoutAvatar = totalUsers - withAvatar;
    return [
      { name: "With Avatar", value: withAvatar },
      { name: "Without Avatar", value: withoutAvatar },
    ];
  }, [users, totalUsers]);

  const COLORS = ["#0088FE", "#FF8042"];

  const signupHours = useMemo(() => {
    const hours = Array(24).fill(0);
    users.forEach((user) => {
      if (user.createdAt) {
        const hour = new Date(user.createdAt).getHours();
        hours[hour]++;
      }
    });
    return hours.map((count, hour) => ({ hour: `${hour}:00`, count }));
  }, [users]);

  const recentUsers = useMemo(() => {
    return [...users]
      .filter((user) => user.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [users]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "30px", fontFamily: "'Segoe UI', sans-serif", background: "#f5f7fa", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>User Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "40px" }}>
        <div style={{
          flex: "1 1 250px",
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "3rem", fontWeight: "700", color: "#0088FE" }}>{totalUsers}</div>
          <div style={{ color: "#555", marginTop: "5px" }}>Total Users</div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", marginBottom: "40px" }}>

        {/* Users Created Per Day */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginBottom: "15px", color: "#333" }}>Users Created (Last 30 Days)</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={usersPerDay}>
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avatar Distribution */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginBottom: "15px", color: "#333" }}>Avatar Distribution</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={avatarData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {avatarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Signup Time of Day */}
        <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ marginBottom: "15px", color: "#333" }}>Signup Time of Day</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={signupHours}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recently Joined Users */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginBottom: "20px", color: "#333" }}>Recently Joined Users</h3>
        <ul style={{ display: "flex", gap: "20px", listStyle: "none", padding: 0, overflowX: "auto" }}>
          {recentUsers.map((user) => (
            <li key={user.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "100px" }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} width={60} height={60} style={{ borderRadius: "50%", marginBottom: 10 }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#ddd", marginBottom: 10 }}></div>
              )}
              <span style={{ fontWeight: "600", color: "#333" }}>{user.name}</span>
              <span style={{ fontSize: "0.8rem", color: "#777" }}>{new Date(user.createdAt).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
