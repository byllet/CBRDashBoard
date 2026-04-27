import '../App.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:15001';

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

function Page1() {
  const [chartType, setChartType] = useState('line');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('currency_rates_dollar');
  const [fromDate, setFromDate] = useState(new Date('2024-01-01'));
  const [toDate, setToDate] = useState(new Date());

  const metricNames = {
    'currency_rates_dollar': 'Доллар (USD)',
    'currency_rates_euro': 'Евро (EUR)',
    'currency_rates_yuan': 'Юань (CNY)'
  };

  const columns = [
    {
      field: 'date',
      headerName: 'Дата',
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      valueFormatter: (params) => {
        if (!params) return '';
        return params.value?.split('T')[0] || params.value;
      }
    },
    {
      field: 'value',
      headerName: 'Рублей за единицу валюты',
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

        const fromStr = fromDate.toISOString().split('T')[0];
        const toStr = toDate.toISOString().split('T')[0];

        const result = await fetchMetrics({
          metric: metric,
          region: 'Russian Federation',
          from: fromStr,
          to: toStr
        });

        let formattedData = [];

        if (Array.isArray(result.data)) {
          for (let i = 0; i < result.data.length; i++) {
            const item = result.data[i];
            formattedData.push({
              id: `${metric}_${item.record_date}_${i}`,
              date: item.record_date.split("T")[0],
              value: item.parameter_value
            });
          }
        }

        const uniqueData = {};
        for (const item of formattedData) {
          const dateKey = item.date.split('T')[0];
          if (!uniqueData[dateKey]) {
            uniqueData[dateKey] = item;
          }
        }
        formattedData = Object.values(uniqueData);
        formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log('Уникальные данные:', formattedData);
        setData(formattedData);

      } catch (err) {
        console.error('Ошибка:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [metric, fromDate, toDate]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: '5px 0 0 0', color: '#8884d8' }}>
            {payload[0].value?.toFixed(2)} рублей за единицу валюты
          </p>
        </div>
      );
    }
    return null;
  };

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
            <LineChart data={data}>
              <XAxis
                dataKey="date"
                interval={0}
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#8884d8" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      }

      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              interval={0}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      );
    } catch (err) {
      console.error('Ошибка рендеринга:', err);
      return <div style={{ color: 'red', padding: '20px' }}>Ошибка отображения графика</div>;
    }
  };

  const setQuickPeriod = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
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
        <h1>Курсы валют</h1>
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
              onChange={(newValue) => setFromDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: '160px' }} />}
              format="dd.MM.yyyy"
              views={['year', 'month', 'day']}
              openTo="day"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <label style={{ margin: 0, lineHeight: 'normal' }}>По:</label>
            <DatePicker
              value={toDate}
              onChange={(newValue) => setToDate(newValue)}
              renderInput={(params) => <TextField {...params} size="small" sx={{ width: '160px' }} />}
              format="dd.MM.yyyy"
              views={['year', 'month', 'day']}
              openTo="day"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setQuickPeriod(7)} style={buttonStyle}>7 дней</button>
            <button onClick={() => setQuickPeriod(30)} style={buttonStyle}>30 дней</button>
            <button onClick={() => setQuickPeriod(365)} style={buttonStyle}>1 год</button>
            <button
              onClick={() => {
                setFromDate(new Date('2000-01-01'));
                setToDate(new Date());
              }}
              style={buttonStyle}
            >
              Всё время
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setMetric('currency_rates_dollar')}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: metric === 'currency_rates_dollar' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Доллар (USD)
          </button>
          <button
            onClick={() => setMetric('currency_rates_euro')}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: metric === 'currency_rates_euro' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Евро (EUR)
          </button>
          <button
            onClick={() => setMetric('currency_rates_yuan')}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: metric === 'currency_rates_yuan' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Юань (CNY)
          </button>

          <button
            onClick={() => setChartType('line')}
            style={{
              marginLeft: '20px',
              padding: '10px 20px',
              backgroundColor: chartType === 'line' ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Линейный график
          </button>
          <button
            onClick={() => setChartType('bar')}
            style={{
              padding: '10px 20px',
              backgroundColor: chartType === 'bar' ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Столбчатый график
          </button>
        </div>

        {renderChart()}

        <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
          <DataGrid
            rows={data}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            checkboxSelection={false}
            disableRowSelectionOnClick
          />
        </div>

        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          {metricNames[metric]} с {fromDate.toISOString().split('T')[0]} по {toDate.toISOString().split('T')[0]} (Россия) | Записей: {data.length}
        </div>
      </div>
    </LocalizationProvider>
  );
}

const buttonStyle = {
  padding: '8px 15px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default Page1;