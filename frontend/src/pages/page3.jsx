import '../App.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:15001';

const fetchMetrics = async ({ metric, region, from, to }) => {
    const params = new URLSearchParams();
    params.append('metric', metric);
    if (region) params.append('region', region);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await fetch(`${API_BASE_URL}/api/metrics?${params.toString()}`);
    const url = `${API_BASE_URL}/api/metrics?${params.toString()}`;
    console.log('📤 Запрос URL:', url);

    if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status}`);
    }

    return response.json();
};

function Page3() {
    const [chartType, setChartType] = useState('bar');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 2);
        return date;
    });
    const [toDate, setToDate] = useState(new Date());
    const columns = [
        {
            field: 'date',
            headerName: 'Дата',
            flex: 1,
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                if (!params) return '';
                return params.value || params;
            }
        },
        {
            field: 'total',
            headerName: 'Всего (млрд ₽)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(0);
            }
        },
        {
            field: 'm1',
            headerName: 'M1 (млрд ₽)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(0);
            }
        },
        {
            field: 'financial',
            headerName: 'Финансовые орг.',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(0);
            }
        },
        {
            field: 'nonfinancial',
            headerName: 'Нефинансовые орг.',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(0);
            }
        },
        {
            field: 'households',
            headerName: 'Домохозяйства',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(0);
            }
        },
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-01`;
                const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-01`;

                // Загружаем все агрегаты
                const metrics = {
                    total: 'money_aggregates_total',
                    m1: 'money_aggregates_m1',
                    financial: 'money_aggregates_financial_orgs',
                    nonfinancial: 'money_aggregates_nonfinancial_orgs',
                    households: 'money_aggregates_households'
                };

                const results = {};

                for (const [key, metricName] of Object.entries(metrics)) {
                    const result = await fetchMetrics({
                        metric: metricName,
                        region: 'Russian Federation',
                        from: fromStr,
                        to: toStr
                    });
                    results[key] = result.data || [];
                }

                // Объединяем по датам
                const dateMap = new Map();

                for (const item of results.total) {
                    const date = item.record_date.split('T')[0].slice(0, 7);
                    if (!dateMap.has(date)) dateMap.set(date, { date, total: 0, m1: 0, financial: 0, nonfinancial: 0, households: 0 });
                    dateMap.get(date).total = item.parameter_value;
                }

                for (const item of results.m1) {
                    const date = item.record_date.split('T')[0].slice(0, 7);
                    if (!dateMap.has(date)) dateMap.set(date, { date, total: 0, m1: 0, financial: 0, nonfinancial: 0, households: 0 });
                    dateMap.get(date).m1 = item.parameter_value;
                }

                for (const item of results.financial) {
                    const date = item.record_date.split('T')[0].slice(0, 7);
                    if (!dateMap.has(date)) dateMap.set(date, { date, total: 0, m1: 0, financial: 0, nonfinancial: 0, households: 0 });
                    dateMap.get(date).financial = item.parameter_value;
                }

                for (const item of results.nonfinancial) {
                    const date = item.record_date.split('T')[0].slice(0, 7);
                    if (!dateMap.has(date)) dateMap.set(date, { date, total: 0, m1: 0, financial: 0, nonfinancial: 0, households: 0 });
                    dateMap.get(date).nonfinancial = item.parameter_value;
                }

                for (const item of results.households) {
                    const date = item.record_date.split('T')[0].slice(0, 7);
                    if (!dateMap.has(date)) dateMap.set(date, { date, total: 0, m1: 0, financial: 0, nonfinancial: 0, households: 0 });
                    dateMap.get(date).households = item.parameter_value;
                }

                let finalData = Array.from(dateMap.values());
                finalData.sort((a, b) => a.date.localeCompare(b.date));

                console.log('Денежные агрегаты:', finalData);
                setData(finalData);

            } catch (err) {
                console.error('Ошибка:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [fromDate, toDate]);

    const renderChart = () => {
        if (!Array.isArray(data) || data.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                    Нет данных для отображения
                </div>
            );
        }

        try {
            if (chartType === 'line') {
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                            <XAxis
                                dataKey="date"
                                interval={0}
                                fontSize={14}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                label={{ value: 'млрд руб', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                                tick={{ fontSize: 14 }}
                            />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(0)} млрд руб`} />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#8884d8" name="Всего" strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="m1" stroke="#82ca9d" name="M1" strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="financial" stroke="#ffc658" name="Финансовые орг." strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="nonfinancial" stroke="#ff8042" name="Нефинансовые орг." strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="households" stroke="#e9ee44" name="Домохозяйства" strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            } else if (chartType === 'bar') {
                // Накопительные столбцы
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                            <XAxis
                                dataKey="date"
                                interval={0}
                                fontSize={14}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                label={{ value: 'млрд руб', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                                tick={{ fontSize: 14 }}
                            />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(0)} млрд руб`} />
                            <Legend />
                            <Bar dataKey="total" stackId="a" fill="#8884d8" name="Всего" isAnimationActive={false} />
                            <Bar dataKey="m1" stackId="a" fill="#82ca9d" name="M1" isAnimationActive={false} />
                            <Bar dataKey="financial" stackId="a" fill="#ffc658" name="Финансовые орг." isAnimationActive={false} />
                            <Bar dataKey="nonfinancial" stackId="a" fill="#ff8042" name="Нефинансовые орг." isAnimationActive={false} />
                            <Bar dataKey="households" stackId="a" fill="#e8e818" name="Домохозяйства" isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            } else {
                // Столбики рядом
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                            <XAxis
                                dataKey="date"
                                interval={0}
                                fontSize={14}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                label={{ value: 'млрд руб', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                                tick={{ fontSize: 14 }}
                            />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(0)} млрд руб`} />
                            <Legend />
                            <Bar dataKey="total" fill="#8884d8" name="Всего" isAnimationActive={false} />
                            <Bar dataKey="m1" fill="#82ca9d" name="M1" isAnimationActive={false} />
                            <Bar dataKey="financial" fill="#ffc658" name="Финансовые орг." isAnimationActive={false} />
                            <Bar dataKey="nonfinancial" fill="#ff8042" name="Нефинансовые орг." isAnimationActive={false} />
                            <Bar dataKey="households" fill="#ff6b6b" name="Домохозяйства" isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            }
        } catch (err) {
            console.error('Ошибка рендеринга:', err);
            return <div style={{ color: 'red', padding: '20px' }}>Ошибка отображения графика</div>;
        }
    };

    const setQuickPeriod = (months) => {
        const to = new Date();
        const from = new Date();
        from.setMonth(to.getMonth() - months);
        setToDate(to);
        setFromDate(from);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка данных...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                Ошибка: {error}
            </div>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div style={{ padding: '20px' }}>
                <h1>Денежные агрегаты</h1>

                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label style={{ margin: 0, lineHeight: 'normal' }}>С:</label>
                        <DatePicker
                            value={fromDate}
                            onChange={setFromDate}
                            renderInput={(params) => <TextField {...params} size="small" sx={{ width: '160px' }} />}
                            format="MM.yyyy"
                            views={['year', 'month']}
                            openTo="year"
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label style={{ margin: 0, lineHeight: 'normal' }}>По:</label>
                        <DatePicker
                            value={toDate}
                            onChange={setToDate}
                            renderInput={(params) => <TextField {...params} size="small" sx={{ width: '160px' }} />}
                            format="MM.yyyy"
                            views={['year', 'month']}
                            openTo="year"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={() => setQuickPeriod(6)} style={buttonStyle}>6 месяцев</button>
                        <button onClick={() => setQuickPeriod(12)} style={buttonStyle}>1 год</button>
                        <button onClick={() => setQuickPeriod(24)} style={buttonStyle}>2 года</button>
                        <button onClick={() => setQuickPeriod(60)} style={buttonStyle}>5 лет</button>
                        <button onClick={() => { setFromDate(new Date('2000-01-01')); setToDate(new Date()); }} style={buttonStyle}>Всё время</button>
                    </div>
                </div>

                {/* Кнопки выбора типа графика */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setChartType('bar')}
                        style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: chartType === 'bar' ? '#28a745' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Накопительные
                    </button>
                    <button
                        onClick={() => setChartType('barGroup')}
                        style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: chartType === 'barGroup' ? '#28a745' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Рядом
                    </button>
                    <button
                        onClick={() => setChartType('line')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: chartType === 'line' ? '#28a745' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Линейный
                    </button>
                </div>

                {/* График */}
                {renderChart()}

                {/* Таблица */}
                <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
                    <DataGrid
                        rows={data.map((d, i) => ({ ...d, id: i }))}
                        columns={columns}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        pageSizeOptions={[5, 10, 25]}
                        checkboxSelection={false}
                        disableRowSelectionOnClick
                    />
                </div>

                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Денежная масса России с {String(fromDate.getMonth() + 1).padStart(2, '0')}.{fromDate.getFullYear()} по {String(toDate.getMonth() + 1).padStart(2, '0')}.{toDate.getFullYear()} | Месяцев: {data.length}
                </div>
            </div>
        </LocalizationProvider>
    );
}

const buttonStyle = { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Page3;