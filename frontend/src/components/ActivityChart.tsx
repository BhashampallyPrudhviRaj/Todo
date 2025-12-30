import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card } from './ui/Card';
import { Todo } from '../../../shared/types';

interface ActivityChartProps {
  todos: Todo[];
}

export const ActivityChart = ({ todos }: ActivityChartProps) => {
  const data = useMemo(() => {
    // Helper to get local date string (YYYY-MM-DD) without UTC conversion
    const getLocalDateString = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Generate last 7 days including today (using local dates)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return getLocalDateString(d);
    });

    return last7Days.map(dateStr => {
      // Compare using local dates
      const dayTodos = todos.filter(t => {
        const createdDate = new Date(t.createdAt);
        return getLocalDateString(createdDate) === dateStr;
      });
      const completed = dayTodos.filter(t => t.isCompleted).length;
      const created = dayTodos.length;
      
      // Parse dateStr to get weekday name
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        created
      };
    });
  }, [todos]);

  return (
    <Card className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Weekly Activity</h2>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8884d8' }} />
            <span style={{ color: 'var(--text-muted)' }}>Created</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#82ca9d' }} />
            <span style={{ color: 'var(--text-muted)' }}>Completed</span>
          </div>
        </div>
      </div>
      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid var(--card-border)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="created" stroke="#8884d8" fillOpacity={1} fill="url(#colorCreated)" name="Created" />
            <Area type="monotone" dataKey="completed" stroke="#82ca9d" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
