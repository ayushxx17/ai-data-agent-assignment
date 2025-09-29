import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);
  const backend = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  const submit = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResp(null);
    try {
      const r = await fetch(`${backend}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const data = await r.json();
      setResp(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!resp?.rows?.length) return;
    const cols = resp.columns || Object.keys(resp.rows[0]);
    const csv = [
      cols.join(','),
      ...resp.rows.map((r) =>
        cols.map((c) => `"${(r[c] ?? '').toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySQL = () => {
    if (!resp?.sql) return;
    navigator.clipboard.writeText(resp.sql);
    try {
      // Friendly small UI feedback
      // Some browsers block alert in certain flows; keep simple
      alert('SQL copied to clipboard');
    } catch (e) {
      // ignore
    }
  };

  const renderChart = () => {
    if (!resp?.chart || !resp?.rows?.length) return null;
    const chart = resp.chart;
    const cols = resp.columns || Object.keys(resp.rows[0]);
    const xKey = chart.x || cols[0];
    const yKey = chart.y || cols[1];

    const numericRows = resp.rows.map((r) => ({ ...r, [yKey]: Number(r[yKey]) }));

    if (chart.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={numericRows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yKey} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chart.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={numericRows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (chart.type === 'pie') {
      const pieData = resp.rows.map((r) => ({ name: r[xKey], value: Number(r[yKey]) }));
      const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
      return (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120} label>
              {pieData.map((entry, index) => (
                <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <div className="p-4 bg-yellow-50 rounded">Chart type <code>{chart.type}</code> not supported by the frontend yet.</div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">AI Data Agent — Demo</h1>
        <p className="text-sm text-gray-600 mb-4">Type a business question and get a natural-language answer, SQL, table and chart.</p>

        <form onSubmit={submit} className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Show me total revenue by region"
            className="flex-1 p-3 border rounded-md"
            rows={2}
          />
          <div className="flex flex-col gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {loading ? 'Thinking...' : 'Ask'}
            </button>
            <button type="button" onClick={() => { setQuery('Show me total revenue by region'); }} className="px-3 py-2 border rounded-md text-sm">
              Example
            </button>
          </div>
        </form>

        {error && <div className="mt-4 text-red-600">Error: {error}</div>}
        {resp && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-semibold">Answer</h2>
                <p className="text-gray-700">{resp.summary || '—'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={copySQL} className="px-3 py-1 border rounded">Copy SQL</button>
                <button onClick={downloadCSV} className="px-3 py-1 border rounded">Download CSV</button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">SQL</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{resp.sql}</pre>
            </div>

            <div>
              <h3 className="font-medium mb-2">Chart</h3>
              {renderChart()}
            </div>

            <div>
              <h3 className="font-medium mb-2">Table</h3>
              <div className="overflow-auto border rounded">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      {(resp.columns || Object.keys(resp.rows[0] || {})).map((col) => (
                        <th key={col} className="text-left px-3 py-2 text-sm">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resp.rows.map((r, i) => (
                      <tr key={i} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                        {(resp.columns || Object.keys(r)).map((col) => (
                          <td key={col} className="px-3 py-2 text-sm">{String(r[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">Backend: <code>{backend}</code></div>

      </div>
    </div>
  );
}
