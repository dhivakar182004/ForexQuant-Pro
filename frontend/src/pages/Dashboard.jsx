import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, Target, TrendingUp, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [summary, setSummary] = useState({
        totalStrategies: 0,
        totalBacktests: 0,
        netProfit: 0.0,
        riskSummary: 'Moderate'
    });

    // Mocking fetched data instead of hitting API if unregistered
    useEffect(() => {
        // In a real scenario, we'd fetch from /api/dashboard/summary
        setSummary({
            totalStrategies: 12,
            totalBacktests: 145,
            netProfit: 12500.50,
            riskSummary: 'Low Risk'
        });
    }, []);

    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Portfolio Equity ($)',
                data: [10000, 10500, 10200, 11000, 11800, 11500, 12500],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
            }
        ]
    };

    const barChartData = {
        labels: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
        datasets: [
            {
                label: 'Win Rate (%)',
                data: [65, 58, 72, 54],
                backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
            x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };

    return (
        <div className="fade-in">
            <h2 className="mb-4" style={{ fontWeight: 600 }}>Dashboard Overview</h2>

            {/* Metric Cards */}
            <div className="row g-4 mb-4">
                {[
                    { title: 'Total Strategies', value: summary.totalStrategies, icon: Target, color: '#3b82f6' },
                    { title: 'Backtests Executed', value: summary.totalBacktests, icon: Activity, color: '#8b5cf6' },
                    { title: 'Net Profit', value: `$${summary.netProfit.toLocaleString()}`, icon: TrendingUp, color: '#10b981' },
                    { title: 'Risk Profile', value: summary.riskSummary, icon: AlertTriangle, color: '#f59e0b' }
                ].map((item, idx) => (
                    <div className="col-md-3" key={idx}>
                        <div className="glass-card p-4 d-flex align-items-center justify-content-between h-100">
                            <div>
                                <div className="text-secondary mb-1" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{item.value}</div>
                            </div>
                            <div className="rounded p-3" style={{ background: `rgba(${parseInt(item.color.slice(1, 3), 16)}, ${parseInt(item.color.slice(3, 5), 16)}, ${parseInt(item.color.slice(5, 7), 16)}, 0.1)` }}>
                                <item.icon size={28} color={item.color} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="row g-4">
                <div className="col-md-8">
                    <div className="glass-card p-4" style={{ height: '400px' }}>
                        <h5 className="mb-3 text-secondary">Equity Curve</h5>
                        <div style={{ height: '300px' }}>
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="glass-card p-4" style={{ height: '400px' }}>
                        <h5 className="mb-3 text-secondary">Win Rate by Pair</h5>
                        <div style={{ height: '300px' }}>
                            <Bar data={barChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
