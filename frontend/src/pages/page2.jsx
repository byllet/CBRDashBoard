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

function Page2() {
    const [chartType, setChartType] = useState('bar');
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
        { 
            field: 'date', 
            headerName: aggregation === 'month' ? 'Дата (месяц)' : 'Год', 
            flex: 1, 
            headerAlign: 'left', 
            align: 'left' 
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
    ];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const fromStr = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}-01`;
                const toStr = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}-01`;

                const metricsList = {
                    short_term: 'credits_stats_short_term',
                    mid_term: 'credits_stats_1_to_3_years',
                    long_term: 'credits_stats_over_3_years'
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
                            dateMap.set(date, { date, short_term: 0, mid_term: 0, long_term: 0, count: 0 });
                        }
                        const existing = dateMap.get(date);
                        existing[key] += item.parameter_value;
                        existing.count++;
                    }
                }

                let finalData = Array.from(dateMap.values()).map(d => ({
                    id: d.date,
                    date: d.date,
                    short_term: d.short_term / (d.count / Object.keys(metricsList).length),
                    mid_term: d.mid_term / (d.count / Object.keys(metricsList).length),
                    long_term: d.long_term / (d.count / Object.keys(metricsList).length),
                }));
                
                finalData.sort((a, b) => a.date.localeCompare(b.date));

                console.log('Данные по кредитам:', finalData);
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
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis 
                                label={{ value: 'ставка, %', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                            <Legend />
                            <Line type="monotone" dataKey="short_term" stroke="#8884d8" name="Краткосрочные" strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="mid_term" stroke="#82ca9d" name="1-3 года" strokeWidth={2} isAnimationActive={false} />
                            <Line type="monotone" dataKey="long_term" stroke="#ffc658" name="Более 3 лет" strokeWidth={2} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                );
            } else {
                // Гистограмма (столбцы рядом)
                return (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                            <XAxis 
                                dataKey="date" 
                                interval={0}
                                fontSize={12}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis 
                                label={{ value: 'ставка, %', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip formatter={(value) => `${Number(value).toFixed(2)}%`} />
                            <Legend />
                            <Bar dataKey="short_term" fill="#8884d8" name="Краткосрочные" isAnimationActive={false} />
                            <Bar dataKey="mid_term" fill="#82ca9d" name="1-3 года" isAnimationActive={false} />
                            <Bar dataKey="long_term" fill="#ffc658" name="Более 3 лет" isAnimationActive={false} />
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
                <h1>Статистика кредитования</h1>

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
                    Ставки по кредитам с {String(fromDate.getMonth() + 1).padStart(2, '0')}.{fromDate.getFullYear()} по {String(toDate.getMonth() + 1).padStart(2, '0')}.{toDate.getFullYear()} (Россия) | 
                    {aggregation === 'month' ? ` Месяцев: ${data.length}` : ` Лет: ${data.length}`}
                </div>
            </div>
        </LocalizationProvider>
    );
}

const buttonStyle = { padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };

export default Page2;