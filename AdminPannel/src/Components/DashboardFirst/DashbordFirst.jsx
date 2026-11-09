
import React, { useMemo, useState } from "react";

import {
  Package,
  Tractor,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  ChevronDown,
  BarChart3,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./DashbordFirst.css";

// ==============================
// CHART DATA
// ==============================

const chartData = {
  "Last 7 Days": [
    { date: "Oct 29", enquiries: 10, products: 18, machinery: 5, leads: 4 },
    { date: "Oct 30", enquiries: 20, products: 24, machinery: 8, leads: 7 },
    { date: "Oct 31", enquiries: 18, products: 22, machinery: 7, leads: 6 },
    { date: "Nov 01", enquiries: 29, products: 32, machinery: 12, leads: 10 },
    { date: "Nov 02", enquiries: 30, products: 35, machinery: 14, leads: 12 },
    { date: "Nov 03", enquiries: 41, products: 42, machinery: 19, leads: 17 },
    { date: "Nov 04", enquiries: 35, products: 38, machinery: 16, leads: 14 },
  ],

  "Last 30 Days": [
    { date: "Oct 06", enquiries: 15, products: 20, machinery: 7, leads: 5 },
    { date: "Oct 11", enquiries: 25, products: 27, machinery: 10, leads: 8 },
    { date: "Oct 16", enquiries: 22, products: 24, machinery: 9, leads: 7 },
    { date: "Oct 21", enquiries: 34, products: 36, machinery: 15, leads: 12 },
    { date: "Oct 26", enquiries: 38, products: 41, machinery: 18, leads: 15 },
    { date: "Oct 31", enquiries: 46, products: 48, machinery: 23, leads: 20 },
    { date: "Nov 04", enquiries: 42, products: 45, machinery: 21, leads: 18 },
  ],

  "Last 90 Days": [
    { date: "Sep 06", enquiries: 12, products: 15, machinery: 5, leads: 3 },
    { date: "Sep 21", enquiries: 20, products: 24, machinery: 8, leads: 6 },
    { date: "Oct 06", enquiries: 26, products: 29, machinery: 11, leads: 9 },
    { date: "Oct 16", enquiries: 23, products: 26, machinery: 10, leads: 8 },
    { date: "Oct 26", enquiries: 35, products: 39, machinery: 16, leads: 13 },
    { date: "Oct 31", enquiries: 45, products: 49, machinery: 22, leads: 19 },
    { date: "Nov 04", enquiries: 52, products: 56, machinery: 27, leads: 23 },
  ],
};

// ==============================
// DASHBOARD METRICS
// ==============================

const dashboardMetrics = [
  {
    id: "products",
    title: "Total Products",
    value: "248",
    growth: "+12%",
    icon: Package,
    color: "green",
    chartKey: "products",
    chartLabel: "Products Added",
  },
  {
    id: "machinery",
    title: "Machinery & Equipment",
    value: "56",
    growth: "+8%",
    icon: Tractor,
    color: "blue",
    chartKey: "machinery",
    chartLabel: "Machinery Enquiries",
  },
  {
    id: "enquiries",
    title: "Total Enquiries",
    value: "129",
    growth: "+18%",
    icon: Users,
    color: "orange",
    chartKey: "enquiries",
    chartLabel: "Total Enquiries",
  },
  {
    id: "leads",
    title: "Cold Leads",
    value: "73",
    growth: "+6%",
    icon: Target,
    color: "purple",
    chartKey: "leads",
    chartLabel: "Cold Leads",
  },
];

// ==============================
// MAIN DASHBOARD COMPONENT
// ==============================

const DashbordFirst = ({ onViewProducts }) => {
  const [period, setPeriod] = useState("Last 7 Days");
  const [activeMetric, setActiveMetric] = useState("enquiries");

  const selectedMetric = dashboardMetrics.find(
    (item) => item.id === activeMetric
  );

  const currentChartData = useMemo(() => {
    return chartData[period] || chartData["Last 7 Days"];
  }, [period]);

  const handleMetricClick = (metric) => {
    setActiveMetric(metric.id);
  };

  const handleViewProducts = () => {
    if (onViewProducts) {
      onViewProducts();
    } else {
      window.location.href = "/products";
    }
  };

  return (
    <section className="Dashboard-First--wrapper">
      <div className="Dashboard-First--container">

        {/* SUMMARY CARDS */}

        <div className="Dashboard-First--stats">
          {dashboardMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <button
                type="button"
                key={metric.id}
                className={`Dashboard-First--stat-card stat-${metric.color} ${
                  activeMetric === metric.id ? "active" : ""
                }`}
                onClick={() => handleMetricClick(metric)}
                aria-pressed={activeMetric === metric.id}
                title={`View ${metric.title} analytics`}
              >
                <div className="Dashboard-First--stat-icon">
                  <Icon size={27} strokeWidth={2} />
                </div>

                <div className="Dashboard-First--stat-content">
                  <span className="Dashboard-First--stat-title">
                    {metric.title}
                  </span>

                  <strong className="Dashboard-First--stat-value">
                    {metric.value}
                  </strong>
                </div>

                <div className="Dashboard-First--stat-growth">
                  <TrendingUp size={15} strokeWidth={2.5} />
                  <span>{metric.growth}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN DASHBOARD CONTENT */}

        <div className="Dashboard-First--main-grid">

          {/* ANALYTICS CHART */}

          <div className="Dashboard-First--chart-card">

            <div className="Dashboard-First--chart-header">

              <div className="Dashboard-First--chart-heading">
                <div className="Dashboard-First--chart-icon">
                  <BarChart3 size={21} strokeWidth={2.5} />
                </div>

                <div>
                  <h3>Enquiries Overview</h3>
                  <p>Track your business performance</p>
                </div>
              </div>

              <div className="Dashboard-First--filter">
                <CalendarDays size={15} />

                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  aria-label="Select analytics period"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                </select>

                <ChevronDown size={15} />
              </div>

            </div>

            {/* CHART SUMMARY */}

            <div className="Dashboard-First--chart-summary">
              <div>
                <span className="Dashboard-First--chart-label">
                  {selectedMetric?.chartLabel}
                </span>

                <strong className="Dashboard-First--chart-total">
                  {selectedMetric?.value}
                </strong>
              </div>

              <span className="Dashboard-First--chart-trend">
                <TrendingUp size={14} />
                {selectedMetric?.growth} this period
              </span>
            </div>

            {/* CHART */}

            <div className="Dashboard-First--chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentChartData}
                  margin={{
                    top: 8,
                    right: 10,
                    left: -22,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardGreenGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#38b34a"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="95%"
                        stopColor="#38b34a"
                        stopOpacity={0.025}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#e9edf0"
                    strokeDasharray="0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#727983",
                      fontSize: 11,
                    }}
                    axisLine={{ stroke: "#e5e9ed" }}
                    tickLine={false}
                    tickMargin={9}
                  />

                  <YAxis
                    domain={[0, "auto"]}
                    tick={{
                      fill: "#727983",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "1px solid #e6eee7",
                      boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
                      fontSize: "12px",
                    }}
                    labelStyle={{
                      color: "#303b34",
                      fontWeight: 700,
                    }}
                    itemStyle={{
                      color: "#269d38",
                      fontWeight: 600,
                    }}
                    cursor={{
                      stroke: "#9bd9a4",
                      strokeDasharray: "4 4",
                    }}
                    formatter={(value) => [
                      value,
                      selectedMetric?.chartLabel,
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey={selectedMetric?.chartKey || "enquiries"}
                    stroke="#2da83e"
                    strokeWidth={2.5}
                    fill="url(#dashboardGreenGradient)"
                    activeDot={{
                      r: 5,
                      fill: "#ffffff",
                      stroke: "#2da83e",
                      strokeWidth: 2.5,
                    }}
                    dot={{
                      r: 3,
                      fill: "#ffffff",
                      stroke: "#2da83e",
                      strokeWidth: 2,
                    }}
                    animationDuration={700}
                  />

                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* TRACTOR PROMOTIONAL BANNER */}

          <div className="Dashboard-First--promo-card">

            {/* DARK IMAGE OVERLAY */}
            <div className="Dashboard-First--promo-overlay"></div>

            {/* BANNER TEXT CONTENT */}
            <div className="Dashboard-First--promo-content">

              {/* GREEN DECORATIVE LINES */}
              <div className="Dashboard-First--promo-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>

              {/* HEADING */}
              <h2>
                Powering
                <br />
                Modern Farming
              </h2>

              {/* DESCRIPTION */}
              <p>
                Reliable Tractors & Equipment for
                <br className="promo-desktop-break" />
                Higher Productivity
              </p>

              {/* BUTTON */}
              <button
                type="button"
                className="Dashboard-First--promo-button"
                onClick={handleViewProducts}
              >
                View Products
                <ArrowRight size={17} />
              </button>

            </div>

            {/* BOTTOM RIGHT BADGE */}
            <div className="Dashboard-First--promo-badge">
              <ArrowUpRight size={17} />
              <span>Smart Farming</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default DashbordFirst;
