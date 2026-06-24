import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api.ts';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { FiTrendingUp, FiUsers, FiEye, FiClock, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import type { VisitorData } from '../types';

const COLORS = ['#2563EB', '#059669', '#D97706', '#7C3AED', '#EC4899', '#0D9488'];

export default function AnalyticsPage() {
  const [visitors, setVisitors] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getVisitorStats()
      .then(({ data }) => setVisitors(data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trafficSources = [
    { name: 'Direct', value: 35, color: '#2563EB' },
    { name: 'Search', value: 28, color: '#059669' },
    { name: 'Social', value: 18, color: '#D97706' },
    { name: 'Referral', value: 12, color: '#7C3AED' },
    { name: 'Other', value: 7, color: '#EC4899' },
  ];

  const deviceStats = [
    { name: 'Desktop', value: 55, color: '#2563EB' },
    { name: 'Mobile', value: 35, color: '#059669' },
    { name: 'Tablet', value: 10, color: '#7C3AED' },
  ];

  const topPages = [
    { page: '/', views: 12483, avgTime: '3m 24s' },
    { page: '/projects', views: 8932, avgTime: '4m 12s' },
    { page: '/blog', views: 6541, avgTime: '2m 45s' },
    { page: '/about', views: 4321, avgTime: '1m 30s' },
    { page: '/contact', views: 2198, avgTime: '2m 10s' },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><div className="spinner" /></div>;

  const maxVisitor = visitors.length > 0 ? Math.max(...visitors.map(v => v.count)) : 1;
  const totalVisitors = visitors.reduce((s, v) => s + v.count, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Analytics</h2>
          <p>Visitor statistics and insights</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Page Views</div>
              <div className="stat-card-value">{(totalVisitors * 2.3).toLocaleString()}</div>
            </div>
            <div className="stat-card-icon blue"><FiEye size={20} /></div>
          </div>
          <div className="stat-card-change up"><FiArrowUpRight size={12} /> 18.2%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Unique Visitors</div>
              <div className="stat-card-value">{totalVisitors.toLocaleString()}</div>
            </div>
            <div className="stat-card-icon green"><FiUsers size={20} /></div>
          </div>
          <div className="stat-card-change up"><FiArrowUpRight size={12} /> 12.5%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Bounce Rate</div>
              <div className="stat-card-value">32.4%</div>
            </div>
            <div className="stat-card-icon orange"><FiTrendingUp size={20} /></div>
          </div>
          <div className="stat-card-change down"><FiArrowDownRight size={12} /> 2.1%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <div>
              <div className="stat-card-label">Avg. Session</div>
              <div className="stat-card-value">4m 32s</div>
            </div>
            <div className="stat-card-icon purple"><FiClock size={20} /></div>
          </div>
          <div className="stat-card-change up"><FiArrowUpRight size={12} /> 8.3%</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Traffic Sources</h4>
          {trafficSources.map(item => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)', width: 60 }}>{item.name}</span>
              <div style={{ flex: 1, height: 8, background: 'var(--gray-100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, width: 32, textAlign: 'right' }}>{item.value}%</span>
            </div>
          ))}
        </div>
        <div className="analytics-card">
          <h4>Visitor Growth (Monthly)</h4>
          <div style={{ height: 200 }}>
            {visitors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={visitors} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', paddingTop: 80 }}>No data</p>}
          </div>
        </div>
        <div className="analytics-card">
          <h4>Device Statistics</h4>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceStats} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {deviceStats.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {deviceStats.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                  <span style={{ color: 'var(--gray-500)' }}>{d.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="analytics-card">
          <h4>Monthly Trend</h4>
          <div style={{ height: 200 }}>
            {visitors.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitors} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--gray-400)', textAlign: 'center', paddingTop: 80 }}>No data</p>}
          </div>
        </div>
        <div className="analytics-card full">
          <h4>Top Pages</h4>
          <table className="data-table" style={{ border: 'none', boxShadow: 'none' }}>
            <thead>
              <tr><th>Page</th><th>Views</th><th>Avg. Time</th></tr>
            </thead>
            <tbody>
              {topPages.map(p => (
                <tr key={p.page}>
                  <td style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{p.page}</td>
                  <td>{p.views.toLocaleString()}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{p.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
