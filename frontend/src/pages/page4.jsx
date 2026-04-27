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
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const response = await fetch(`${API_BASE_URL}/api/metrics?${params.toString()}`);
    const url = `${API_BASE_URL}/api/metrics?${params.toString()}`;

    if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status}`);
    }

    return response.json();
};

function Page4() {
    const [chartType, setChartType] = useState('bar');
    const [barMode, setBarMode] = useState('grouped');
    const [aggregation, setAggregation] = useState('month');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return date;
    });
    const [toDate, setToDate] = useState(new Date());

    const columns = [
        { field: 'date', headerName: 'Дата', flex: 1, headerAlign: 'left', align: 'left' },
        {
            field: 'on_demand',
            headerName: 'До востребования (%)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(2);
            }
        },
        {
            field: 'short_term',
            headerName: 'Краткосрочные (%)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(2);
            }
        },
        {
            field: 'mid_term',
            headerName: '1-3 года (%)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(2);
            }
        },
        {
            field: 'long_term',
            headerName: 'Более 3 лет (%)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(2);
            }
        },
        {
            field: 'other',
            headerName: 'Остаток (%)',
            flex: 1,
            type: 'number',
            headerAlign: 'left',
            align: 'left',
            valueFormatter: (params) => {
                const val = params;
                if (val === undefined || val === null || isNaN(val)) return '—';
                return Number(val).toFixed(2);
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

                const metricsList = {
                    on_demand: 'deposit_rates_on_demand',
                    short_term: 'deposit_rates_short_term',
                    mid_term: 'deposit_rates_1_to_3_years',
                    long_term: 'deposit_rates_over_3_years'
                };

                const results = {};

                for (const [key, metricName] of Object.entries(metricsList)) {
                    const result = await fetchMetrics({
                        metric: metricName,
                        region: 'Russian Federation',
                        from: fromStr,
                        to: toStr
                    });
                    results[key] = result.data || [];
                }

                const dateMap = new Map();

                for (const key of Object.keys(metricsList)) {
                    for (const item of results[key]) {
                        let date = item.record_date.split('T')[0];
                        if (aggregation === 'month') {
                            date = date.slice(0, 7);
                        } else {
                            date = date.slice(0, 4);
                        }

                        if (!dateMap.has(date)) {
                            dateMap.set(date, { date, on_demand: 0, short_term: 0, mid_term: 0, long_term: 0, count: 0 });
                        }
                        const existing = dateMap.get(date);
                        existing[key] += item.parameter_value;
                        existing.count++;
                    }
                }

                let finalData = Array.from(dateMap.values()).map(d => {
                    const divisor = d.count / Object.keys(metricsList).length;
                    const on_demand = d.on_demand / divisor;
                    const short_term = d.short_term / divisor;
                    const mid_term = d.mid_term / divisor;
                    const long_term = d.long_term / divisor;
                    const total = on_demand + short_term + mid_term + long_term;

                    // Добавляем остаток до 100%
                    const other = Math.max(0, 100 - total);

                    return {
                        id: d.date,
                        date: d.date,
                        on_demand,
                        short_term,
                        mid_term,
                        long_term,
                        other
                    };
                });

                finalData.sort((a, b) => a.date.localeCompare(b.date));

                console.log('Данные по депозитам:', finalData);
                setData(finalData);

            } catch (err) {
                console.error('Ошибка:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [fromDate, toDate, aggregation]);

    // Функция для получения данных для графика (без other для grouped)
    const getChartData = () => {
        if (barMode === 'grouped') {
            // Для режима "рядом" убираем поле other
            return data.map(item => ({
                date: item.date,
                on_demand: item.on_demand,
                short_term: item.short_term,
                mid_term: item.mid_term,
                long_term: item.long_term
            }));
        }
        // Для режима "накопительная" оставляем other
        return data;
    };

    const renderChart = () => {
        if (!Array.isArray(data) || data.length === 0) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>Нет данных</div>;
        }

        const chartData = getChartData();

        try {
            if (chartType === 'line') {
                return (
                    <ResponsiveContainer width="100%" height={450}>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                interval={Math.floor(data.length / 10)}  // Показывать ~10 меток
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis label={{ value: 'ставка, %', angle: -90, position: 'insideLeft', dx: -15 }} />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                            <Legend />
                            <Line type="monotone" dataKey="on_demand" stroke="#8884d8" name="До востребования" strokeWidth={2} isAnimationActive={false} dot={false}/>
                            <Line type="monotone" dataKey="short_term" stroke="#82ca9d" name="Краткосрочные" strokeWidth={2} isAnimationActive={false} dot={false}/>
                            <Line type="monotone" dataKey="mid_term" stroke="#ffc658" name="1-3 года" strokeWidth={2} isAnimationActive={false} dot={false}/>
                            <Line type="monotone" dataKey="long_term" stroke="#ff8042" name="Более 3 лет" strokeWidth={2} isAnimationActive={false} dot={false}/>
                        </LineChart>
                    </ResponsiveContainer>
                );
            } else {
                // Для bar - обрабатываем оба режима (stacked и grouped)
                if (barMode === 'stacked') {
                    return (
                        <ResponsiveContainer width="100%" height={450}>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    interval={Math.floor(data.length / 10)}  // Показывать ~10 меток
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis label={{ value: 'ставка, %', angle: -90, position: 'insideLeft', dx: -15 }} domain={[0, 100]} />
                                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                <Legend />
                                <Bar dataKey="on_demand" stackId="a" fill="#8884d8" name="До востребования" isAnimationActive={false} />
                                <Bar dataKey="short_term" stackId="a" fill="#82ca9d" name="Краткосрочные" isAnimationActive={false} />
                                <Bar dataKey="mid_term" stackId="a" fill="#ffc658" name="1-3 года" isAnimationActive={false} />
                                <Bar dataKey="long_term" stackId="a" fill="#ff8042" name="Более 3 лет" isAnimationActive={false} />
                                <Bar dataKey="other" stackId="a" fill="#9c9e9c" name="Остаток" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    );
                } else {
                    return (
                        <ResponsiveContainer width="100%" height={450}>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    interval={Math.floor(data.length / 10)}  // Показывать ~10 меток
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis label={{ value: 'ставка, %', angle: -90, position: 'insideLeft', dx: -15 }} />
                                <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                                <Legend />
                                <Bar dataKey="on_demand" fill="#8884d8" name="До востребования" isAnimationActive={false} />
                                <Bar dataKey="short_term" fill="#82ca9d" name="Краткосрочные" isAnimationActive={false} />
                                <Bar dataKey="mid_term" fill="#ffc658" name="1-3 года" isAnimationActive={false} />
                                <Bar dataKey="long_term" fill="#ff8042" name="Более 3 лет" isAnimationActive={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    );
                }
            }
        } catch (err) {
            console.error('Ошибка:', err);
            return <div style={{ color: 'red' }}>Ошибка отображения графика</div>;
        }
    };

    const setQuickPeriod = (months) => {
        const to = new Date();
        const from = new Date();
        from.setMonth(to.getMonth() - months);
        setToDate(to);
        setFromDate(from);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка данных...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Ошибка: {error}</div>;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <div style={{ padding: '20px' }}>
                <h1>Ставки по депозитам</h1>

                {/* Блок выбора периода */}
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

                {/* Кнопки выбора */}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setAggregation('month')}
                        style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: aggregation === 'month' ? '#17a2b8' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Помесячно
                    </button>
                    <button
                        onClick={() => setAggregation('year')}
                        style={{
                            marginRight: '20px',
                            padding: '10px 20px',
                            backgroundColor: aggregation === 'year' ? '#17a2b8' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        По годам
                    </button>

                    <button
                        onClick={() => {
                            setChartType('bar');
                            setBarMode('grouped');
                        }}
                        style={{
                            marginRight: '10px',
                            padding: '10px 20px',
                            backgroundColor: chartType === 'bar' && barMode === 'grouped' ? '#28a745' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Гистограмма
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

                {renderChart()}

                {/* <h2 style={{ marginTop: '20px' }}>{aggregation === 'month' ? 'Данные по месяцам' : 'Данные по годам'}</h2> */}
                <div style={{ height: 500, width: '100%', marginTop: '10px' }}>
                    <DataGrid
                        rows={data.map((d, i) => ({ ...d, id: i }))}
                        columns={columns}
                        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                        pageSizeOptions={[10, 25, 50]}
                    />
                </div>

                <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                    Ставки по депозитам с {String(fromDate.getMonth() + 1).padStart(2, '0')}.{fromDate.getFullYear()} по {String(toDate.getMonth() + 1).padStart(2, '0')}.{toDate.getFullYear()} | {aggregation === 'month' ? `Месяцев: ${data.length}` : `Лет: ${data.length}`}
                </div>
            </div>
        </LocalizationProvider>
    );
}

const buttonStyle = { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
export default Page4;