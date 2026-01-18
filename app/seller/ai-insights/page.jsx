"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  // Force Bangladeshi Taka symbol formatting for all amounts
  const formatBDT = (value) => {
    const num = Number(value || 0);
    return `৳${num.toLocaleString("en-US")}`;
  };

  useEffect(() => {
    fetchInsights();
    loadChartLibrary();
  }, []);

  const loadChartLibrary = () => {
    if (!window.Chart) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
      script.async = true;
      script.onload = () => {
        console.log("Chart.js loaded successfully");
      };
      document.body.appendChild(script);
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Force fresh data with cache-busting parameter
      const timestamp = Date.now();
      const { data } = await axios.get(
        `/api/ai/demand-forecast?t=${timestamp}`,
      );
      console.log("[AI Insights] Received data:", {
        recommendations: data.recommendations,
        topProducts: data.topProducts?.map((p) => p.name),
        source: data.source,
        cached: data.cached,
      });
      setInsights(data);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setError(error.response?.data?.error || "Failed to load insights");
      if (error.response?.data?.hint) {
        toast.error(error.response.data.hint);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (insights && chartRef.current && window.Chart) {
      renderChart();
    }
  }, [insights]);

  const renderChart = () => {
    if (!chartRef.current || !window.Chart) return;

    const ctx = chartRef.current.getContext("2d");

    // Prepare data for chart
    const topProducts = insights.topProducts || [];
    const labels = topProducts.slice(0, 5).map((p) => p.name);
    const revenueData = topProducts.slice(0, 5).map((p) => p.totalRevenue);
    const quantityData = topProducts.slice(0, 5).map((p) => p.totalQuantity);

    // Destroy existing chart if it exists
    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    // Create new chart
    chartRef.current.chart = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Revenue (৳)",
            data: revenueData,
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "rgba(16, 185, 129, 1)",
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: "y",
          },
          {
            label: "Quantity Sold",
            data: quantityData,
            backgroundColor: "rgba(59, 130, 246, 0.8)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: { size: 12, weight: "bold" },
              padding: 15,
              usePointStyle: true,
            },
          },
          title: {
            display: true,
            text: "Top 5 Products Performance",
            font: { size: 16, weight: "bold" },
            padding: 20,
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Revenue (৳)",
              font: { weight: "bold" },
            },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Quantity",
              font: { weight: "bold" },
            },
            grid: { drawOnChartArea: false },
          },
          x: {
            grid: { display: false },
          },
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg text-gray-600">
            AI is analyzing your sales data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="md:p-8 p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Load Insights
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchInsights}
              className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (
    !insights ||
    insights.recommendations ===
      "Not enough order data yet. Check back once you have more orders."
  ) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="md:p-8 p-6 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Not Enough Data Yet
            </h2>
            <p className="text-gray-600">
              We need more order history to generate meaningful insights. Check
              back once you have more sales!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getInsightTypeIcon = (type) => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
      <div className="md:p-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-3">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
              </svg>
              AI Business Insights
            </h1>
            <p className="text-gray-600">
              Powered by Gemini AI - Analyzing your sales trends
            </p>
          </div>
          <button
            onClick={fetchInsights}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-emerald-500 transition-colors flex items-center gap-2 text-gray-700 font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* Sales Summary Cards */}
        {insights.salesSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-emerald-100">Total Orders</p>
                <svg
                  className="w-8 h-8 text-emerald-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <p className="text-4xl font-bold">
                {insights.salesSummary.totalOrders}
              </p>
              <p className="text-sm text-emerald-100 mt-2">
                Last {insights.salesSummary.period}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100">Total Revenue</p>
                <svg
                  className="w-8 h-8 text-blue-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-4xl font-bold">
                {formatBDT(insights.salesSummary.totalRevenue)}
              </p>
              <p className="text-sm text-blue-100 mt-2">
                Last {insights.salesSummary.period}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100">Avg Order Value</p>
                <svg
                  className="w-8 h-8 text-purple-100"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-4xl font-bold">
                {formatBDT(insights.salesSummary.averageOrderValue)}
              </p>
              <p className="text-sm text-purple-100 mt-2">Per order</p>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {insights.insights && insights.insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Key Insights
            </h2>
            <div className="space-y-4">
              {insights.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-emerald-200 transition-colors"
                >
                  <div className="mt-1">{getInsightTypeIcon(insight.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {insight.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(insight.priority)}`}
                      >
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-gray-600">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends */}
        {insights.trends && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Growing Trends */}
            {insights.trends.growing && insights.trends.growing.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Growing Trends
                </h3>
                <ul className="space-y-2">
                  {insights.trends.growing.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Declining Trends */}
            {insights.trends.declining &&
              insights.trends.declining.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                    Declining Trends
                  </h3>
                  <ul className="space-y-2">
                    {insights.trends.declining.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Seasonal Patterns */}
            {insights.trends.seasonal &&
              insights.trends.seasonal.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Seasonal Patterns
                  </h3>
                  <ul className="space-y-2">
                    {insights.trends.seasonal.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Performance Chart */}
        {insights.topProducts && insights.topProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div style={{ position: "relative", height: "400px" }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations &&
          Array.isArray(insights.recommendations) &&
          insights.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                Recommended Actions
              </h2>
              <div className="space-y-4">
                {insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-100"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {rec.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">
                      <span className="font-semibold">Action:</span>{" "}
                      {rec.action}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Expected Impact:</span>{" "}
                      {rec.impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Forecast */}
        {insights.forecast && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Demand Forecast
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insights.forecast.nextWeek && (
                <div className="p-5 bg-blue-50 rounded-xl border-2 border-blue-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Next Week
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Estimated Orders:</span>{" "}
                      {insights.forecast.nextWeek.estimatedOrders}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Estimated Revenue:</span>{" "}
                      {formatBDT(insights.forecast.nextWeek.estimatedRevenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span
                        className={`inline-block px-2 py-1 rounded ${
                          insights.forecast.nextWeek.confidence === "high"
                            ? "bg-green-100 text-green-800"
                            : insights.forecast.nextWeek.confidence === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {insights.forecast.nextWeek.confidence} confidence
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {insights.forecast.nextMonth && (
                <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Next Month
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-semibold">Estimated Orders:</span>{" "}
                      {insights.forecast.nextMonth.estimatedOrders}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Estimated Revenue:</span>{" "}
                      {formatBDT(insights.forecast.nextMonth.estimatedRevenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span
                        className={`inline-block px-2 py-1 rounded ${
                          insights.forecast.nextMonth.confidence === "high"
                            ? "bg-green-100 text-green-800"
                            : insights.forecast.nextMonth.confidence ===
                                "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {insights.forecast.nextMonth.confidence} confidence
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Products & Categories */}
        {(insights.topProducts || insights.topCategories) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {insights.topProducts && insights.topProducts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Top Products
                </h3>
                <div className="space-y-3">
                  {insights.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold rounded-full text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {formatBDT(product.totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.totalQuantity} sold
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.topCategories && insights.topCategories.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Top Categories
                </h3>
                <div className="space-y-3">
                  {insights.topCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 font-bold rounded-full text-sm">
                          {index + 1}
                        </span>
                        <p className="font-semibold text-gray-900">
                          {category.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">
                          {formatBDT(category.totalRevenue)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {category.orders} orders
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANOMALY DETECTION */}
        {insights.anomalies && insights.anomalies.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 4v2m-6-4a9 9 0 1118 0 9 9 0 01-18 0z"
                />
              </svg>
              Anomaly Alerts
            </h2>
            <div className="space-y-3">
              {insights.anomalies.map((anomaly, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border-2 ${anomaly.severity === "critical" ? "bg-red-50 border-red-300" : "bg-yellow-50 border-yellow-300"}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {anomaly.date}
                      </p>
                      <p className="text-sm text-gray-600">
                        {anomaly.type === "spike"
                          ? "📈 Sales Spike"
                          : "📉 Sales Drop"}
                        : {formatBDT(anomaly.revenue)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${anomaly.severity === "critical" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"}`}
                    >
                      {anomaly.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVENUE OPPORTUNITIES */}
        {insights.revenueOpportunities &&
          insights.revenueOpportunities.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.23a2 2 0 01-1.789 1.106H2a2 2 0 01-2-2V8a2 2 0 012-2h15.25a2 2 0 012 2z"
                  />
                </svg>
                Revenue Opportunities
              </h2>
              <div className="space-y-4">
                {insights.revenueOpportunities.map((opp, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200"
                  >
                    {opp.type === "underpriced" ? (
                      <div>
                        <p className="font-semibold text-gray-900">
                          {opp.product} - Underpriced
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Increase from {formatBDT(opp.currentPrice)} to{" "}
                          {formatBDT(opp.suggestedPrice)}
                        </p>
                        <p className="text-sm font-semibold text-emerald-700 mt-1">
                          Potential gain: {formatBDT(opp.potentialGain)}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-gray-900">
                          Bundle: {opp.products.join(" + ")}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Suggest {opp.suggestedDiscount}% discount for bundle
                        </p>
                        <p className="text-sm text-emerald-700 mt-1">
                          Category: {opp.category}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* PRICE OPTIMIZATION */}
        {insights.priceOptimizations &&
          insights.priceOptimizations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Price Optimization Assistant
              </h2>
              <div className="space-y-4">
                {insights.priceOptimizations.map((opt, i) => (
                  <div
                    key={i}
                    className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {opt.product}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Current: {formatBDT(opt.currentPrice)} → Optimal:{" "}
                          {formatBDT(opt.optimalPrice)}
                        </p>
                        <p className="text-sm text-blue-700 font-semibold mt-2">
                          Revenue boost: {formatBDT(opt.potentialRevenueBoost)}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                        {opt.confidence}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* TOP CUSTOMERS (CLV) */}
        {insights.topCustomers && insights.topCustomers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h6"
                />
              </svg>
              VIP Customers (Lifetime Value)
            </h2>
            <div className="space-y-3">
              {insights.topCustomers.map((customer, i) => (
                <div
                  key={i}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {customer.name || "Customer"}
                      </p>
                      <p className="text-xs text-gray-600">{customer.email}</p>
                      <p className="text-sm text-gray-700 mt-2">
                        Orders: {customer.orderCount} | Total Spent:{" "}
                        {formatBDT(customer.totalSpent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-700">
                        {formatBDT(customer.clv)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${customer.tier === "VIP" ? "bg-yellow-200 text-yellow-800" : customer.tier === "Premium" ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-800"}`}
                      >
                        {customer.tier}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
