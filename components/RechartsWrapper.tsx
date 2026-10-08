'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ChartProps {
  type: 'bar' | 'line' | 'pie';
  data: any[];
  xKey?: string;
  yKeys?: { key: string; color: string; name: string }[];
  colors?: string[];
}

export default function RechartsWrapper({ type, data, xKey, yKeys, colors }: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-sm text-slate-400">Memuat diagram analitik...</div>;
  }

  return (
    <div className="w-full h-64 text-xs font-sans">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' && xKey && yKeys ? (
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={xKey} stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            <Legend />
            {yKeys.map((item, idx) => (
              <Bar key={idx} dataKey={item.key} name={item.name} fill={item.color} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        ) : type === 'line' && xKey && yKeys ? (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey={xKey} stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            <Legend />
            {yKeys.map((item, idx) => (
              <Line key={idx} type="monotone" dataKey={item.key} name={item.name} stroke={item.color} strokeWidth={2} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors ? colors[index % colors.length] : '#1E40AF'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            <Legend />
          </PieChart>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Konfigurasi diagram salah</div>
        )}
      </ResponsiveContainer>
    </div>
  );
}
