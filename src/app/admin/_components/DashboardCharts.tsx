'use client';

import { useState, useMemo } from 'react';
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { Calendar } from 'lucide-react';

interface ChartDataPoint {
    date: string;
    fullDate: string;
    members: number;
    applications: number;
}

interface DashboardChartsProps {
    data: ChartDataPoint[];
}

type TimeframeType = 'day' | 'week' | 'month';

function aggregateData(data: ChartDataPoint[], timeframe: TimeframeType): ChartDataPoint[] {
    if (timeframe === 'day' || data.length <= 30) {
        return data;
    }

    const aggregated: Record<string, ChartDataPoint> = {};

    data.forEach(item => {
        const date = new Date(item.fullDate);
        let key: string;
        let displayDate: string;

        if (timeframe === 'week') {
            // Group by week
            const weekStart = new Date(date);
            const day = weekStart.getDay();
            const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
            weekStart.setDate(diff);
            key = weekStart.toISOString().split('T')[0];
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            displayDate = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        } else {
            // Group by month
            key = date.toISOString().slice(0, 7);
            displayDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }

        if (!aggregated[key]) {
            aggregated[key] = {
                date: displayDate,
                fullDate: key,
                members: 0,
                applications: 0,
            };
        }

        aggregated[key].members += item.members;
        aggregated[key].applications += item.applications;
    });

    return Object.values(aggregated);
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
    const [timeframe, setTimeframe] = useState<TimeframeType>('day');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Set default dates on first load
    const defaultDates = useMemo(() => {
        if (!data.length) return { start: '', end: '' };
        const firstDate = data[0].fullDate;
        const lastDate = data[data.length - 1].fullDate;
        return { start: firstDate, end: lastDate };
    }, [data]);

    const actualStartDate = startDate || defaultDates.start;
    const actualEndDate = endDate || defaultDates.end;

    // Filter data by date range
    const filteredData = useMemo(() => {
        if (!actualStartDate || !actualEndDate) return data;

        return data.filter(item => {
            const itemDate = item.fullDate;
            return itemDate >= actualStartDate && itemDate <= actualEndDate;
        });
    }, [data, actualStartDate, actualEndDate]);

    const aggregatedData = aggregateData(filteredData, timeframe);

    const timeframeButtons = [
        { label: 'Daily', value: 'day' as TimeframeType },
        { label: 'Weekly', value: 'week' as TimeframeType },
        { label: 'Monthly', value: 'month' as TimeframeType },
    ];

    const handleResetDates = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="space-y-6">
            {/* Date Range and Timeframe Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Chart Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Start Date */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-slate-700 mb-2">Start Date</label>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={defaultDates.start}
                                max={actualEndDate || defaultDates.end}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#038DCD]"
                            />
                        </div>
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-slate-700 mb-2">End Date</label>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={actualStartDate || defaultDates.start}
                                max={defaultDates.end}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#038DCD]"
                            />
                        </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleResetDates}
                            className="w-full px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-all text-sm"
                        >
                            Reset Dates
                        </button>
                    </div>

                    {/* Timeframe Selector */}
                    <div className="flex items-end gap-2">
                        {timeframeButtons.map(btn => (
                            <button
                                key={btn.value}
                                onClick={() => setTimeframe(btn.value)}
                                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${timeframe === btn.value
                                        ? 'bg-[#038DCD] text-white shadow-md'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
                {(startDate || endDate) && (
                    <p className="text-xs text-slate-600 mt-3">
                        Showing data from <span className="font-semibold">{actualStartDate}</span> to <span className="font-semibold">{actualEndDate}</span>
                    </p>
                )}
            </div>

            {/* Combined Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Activity Overview</h2>
                    <p className="text-sm text-slate-500">Members joining and applications submitted</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={aggregatedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#64748b' }}
                            angle={timeframe === 'day' ? -45 : 0}
                            height={timeframe === 'day' ? 80 : 40}
                        />
                        <YAxis
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                            tick={{ fill: '#64748b' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                            }}
                            labelStyle={{ color: '#f1f5f9' }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                        />
                        <Bar
                            dataKey="applications"
                            fill="#038DCD"
                            radius={[8, 8, 0, 0]}
                            name="Applications"
                            opacity={0.7}
                        />
                        <Line
                            type="monotone"
                            dataKey="members"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="New Members"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

          
        </div>
    );
}
