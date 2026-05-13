"use client";

import { useEffect, useState } from "react";

/* ================= TYPES ================= */
type DashboardStats = {
  totalCustomers: number;
  totalOrders: number;
  totalSales: number;
  lowStockItems: number;
};

type Order = {
  id: number;
  customer: string;
  amount: number;
  status: string;
};

type Product = {
  id: number;
  name: string;
  sold: number;
};

type Review = {
  id: number;
  customer: string;
  rating: number;
  comment: string;
};

/* ================= PAGE ================= */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOrders: 0,
    totalSales: 0,
    lowStockItems: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      setLoading(true);

      try {
        /* ===== DASHBOARD STATS ===== */
        const statsRes = await fetch("/api/admin/dashboard", {
          credentials: "include",
        });

        if (statsRes.ok) {
          const data = await statsRes.json();
          if (mounted) {
            setStats({
              totalCustomers: data.totalCustomers ?? 0,
              totalOrders: data.totalOrders ?? 0,
              totalSales: data.totalSales ?? 0,
              lowStockItems: data.lowStockItems ?? 0,
            });
          }
        }

        /* ===== RECENT ORDERS ===== */
        const ordersRes = await fetch("/api/admin/orders", {
          credentials: "include",
        });

        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          if (mounted && Array.isArray(orders)) {
            setRecentOrders(
              orders.slice(0, 5).map((o: any) => ({
                id: o.id,
                customer: o.customerName,
                amount: o.totalAmount,
                status: o.status,
              }))
            );
          }
        }

        /* ===== TOP PRODUCTS (OPTIONAL) ===== */
        // jab tak backend ready nahi, empty hi rahega (NO DUMMY)
        setTopProducts([]);

        /* ===== REVIEWS (OPTIONAL) ===== */
        setReviews([]);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-black">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-bold text-black">Dashboard Overview</h1>
        <p className="text-sm text-black/70 mt-1">
          Store performance & recent activity
        </p>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi title="Total Customers" value={stats.totalCustomers} />
        <Kpi title="Total Orders" value={stats.totalOrders} />
        <Kpi
          title="Total Sales"
          value={`₹${stats.totalSales.toLocaleString()}`}
        />
        <Kpi title="Low Stock Alerts" value={stats.lowStockItems} danger />
      </div>

      {/* ================= CHART PLACEHOLDER ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Chart">
          <div className="h-56 flex items-center justify-center text-gray-400">
            No data yet
          </div>
        </ChartCard>

        <ChartCard title="Sales Analytics">
          <div className="h-56 flex items-center justify-center text-gray-400">
            No data yet
          </div>
        </ChartCard>
      </div>

      {/* ================= ORDERS + PRODUCTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Orders">
          {recentOrders.length === 0 ? (
            <div className="text-sm text-gray-500">No orders yet</div>
          ) : (
            recentOrders.map((o) => (
              <div
                key={o.id}
                className="flex justify-between text-sm border-b py-2"
              >
                <span>{o.customer}</span>
                <span className="font-medium">₹{o.amount}</span>
              </div>
            ))
          )}
        </Card>

        <Card title="Top Selling Products">
          {topProducts.length === 0 ? (
            <div className="text-sm text-gray-500">No data yet</div>
          ) : (
            topProducts.map((p) => (
              <div
                key={p.id}
                className="flex justify-between text-sm border-b py-2"
              >
                <span>{p.name}</span>
                <span className="font-medium">{p.sold} sold</span>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* ================= REVIEWS ================= */}
      <Card title="Recent Reviews">
        {reviews.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews yet</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-b py-2">
              <div className="text-sm font-medium">
                {r.customer} ⭐ {r.rating}/5
              </div>
              <div className="text-xs text-gray-600">{r.comment}</div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

/* ================= COMPONENTS ================= */
function Kpi({
  title,
  value,
  danger,
}: {
  title: string;
  value: any;
  danger?: boolean;
}) {
  return (
    <div className="p-5 bg-white rounded-xl border shadow">
      <div className="text-sm text-gray-500">{title}</div>
      <div
        className={`text-2xl font-semibold mt-2 ${
          danger ? "text-red-600" : "text-black"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl shadow p-5">
      <div className="font-semibold text-black mb-3">{title}</div>
      {children}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl shadow p-5">
      <div className="font-semibold text-black mb-3">{title}</div>
      {children}
    </div>
  );
}
