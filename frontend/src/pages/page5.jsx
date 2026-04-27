import '../App.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
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

function Page5() {
  const [chartType, setChartType] = useState('bar');
  const [aggregation, setAggregation] = useState('month');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metric, setMetric] = useState('loan_rates_total');
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  });
  const [toDate, setToDate] = useState(new Date());

  const metricNames = {
    'loan_rates_total': 'Объем кредитов (всего)',
    'loan_rates_rubles': 'Объем кредитов (рубли)',
    'loan_ratest_other_currencies': 'Объем кредитов (другая валюта)'
  };

  const columns = [
    { 
      field: 'date', 
      headerName: aggregation === 'month' ? 'Дата (месяц)' : 'Год', 
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      valueFormatter: (params) => {
        if (!params) return '';
        return params.value;
      }
    },
    { 
      field: 'value', 
      headerName: 'Объем, млн ₽', 
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

        const result = await fetchMetrics({
          metric: metric,
          region: 'Russian Federation',
          from: fromStr,
          to: toStr
        });

        console.log('Ответ API:', result);

        let formattedData = [];

        if (Array.isArray(result.data)) {
          for (let i = 0; i < result.data.length; i++) {
            const item = result.data[i];
            formattedData.push({
              id: `${metric}_${item.record_date}_${i}`,
              date: item.record_date.split("T")[0].slice(0, 7),
              value: item.parameter_value
            });
          }
        }

        // Удаляем дубликаты по дате
        const uniqueData = {};
        for (const item of formattedData) {
          const dateKey = item.date;
          if (!uniqueData[dateKey]) {
            uniqueData[dateKey] = item;
          }
        }
        
        let aggregatedData = Object.values(uniqueData);
        aggregatedData.sort((a, b) => a.date.localeCompare(b.date));
        
        let finalData;
        
        if (aggregation === 'year') {
          // Группировка по годам (среднее значение за год)
          const yearlyData = {};
          for (const item of aggregatedData) {
            const year = item.date.slice(0, 4);
            if (!yearlyData[year]) {
              yearlyData[year] = { date: year, value: 0, count: 0 };
            }
            yearlyData[year].value += item.value;
            yearlyData[year].count++;
          }
          
          finalData = Object.values(yearlyData).map(y => ({
            id: y.date,
            date: y.date,
            value: y.value / y.count
          }));
          
          finalData.sort((a, b) => a.date.localeCompare(b.date));
        } else {
          // Помесячная агрегация
          const monthlyData = {};
          for (const item of aggregatedData) {
            const month = item.date.slice(0, 7);
            if (!monthlyData[month]) {
              monthlyData[month] = { date: month, value: 0, count: 0 };
            }
            monthlyData[month].value += item.value;
            monthlyData[month].count++;
          }
          
          finalData = Object.values(monthlyData).map(m => ({
            id: m.date,
            date: m.date,
            value: m.value / m.count
          }));
          
          finalData.sort((a, b) => a.date.localeCompare(b.date));
        }

        console.log(`Агрегированные данные (${aggregation === 'year' ? 'по годам' : 'по месяцам'}):`, finalData);
        setData(finalData);

      } catch (err) {
        console.error('Ошибка:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [metric, fromDate, toDate, aggregation]);

  const renderChart = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          Нет данных для отображения
        </div>
      );
    }

    try {
      if (chartType === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
              <XAxis 
                dataKey="date" 
                interval={0}
                fontSize={12}
                angle={aggregation === 'year' ? 0 : -45}
                textAnchor={aggregation === 'year' ? 'middle' : 'end'}
                height={aggregation === 'year' ? 40 : 80}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                label={{ value: 'млн руб', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value) => `${Number(value).toFixed(0)} млн руб`}
                labelFormatter={(label) => aggregation === 'year' ? `${label} год` : `Период: ${label}`}
              />
              <Bar dataKey="value" fill="#8884d8" name="Объем кредитов" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        );
      } else {
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
              <XAxis 
                dataKey="date" 
                interval={0}
                fontSize={12}
                angle={aggregation === 'year' ? 0 : -45}
                textAnchor={aggregation === 'year' ? 'middle' : 'end'}
                height={aggregation === 'year' ? 40 : 80}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                label={{ value: 'млн руб', angle: -90, position: 'insideLeft', dx: -15, style: { textAnchor: 'middle' } }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value) => `${Number(value).toFixed(0)} млн руб`}
                labelFormatter={(label) => aggregation === 'year' ? `${label} год` : `Период: ${label}`}
              />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
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
        <h1>Объёмы кредитования</h1>

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
              onChange={(newValue) => setFromDate(newValue)}
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
              onChange={(newValue) => setToDate(newValue)}
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

        {/* Кнопки метрик */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setMetric('loan_rates_total')}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: metric === 'loan_rates_total' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Все кредиты
          </button>
          <button
            onClick={() => setMetric('loan_rates_rubles')}
            style={{
              marginRight: '10px',
              padding: '10px 20px',
              backgroundColor: metric === 'loan_rates_rubles' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            В рублях
          </button>
          <button
            onClick={() => setMetric('loan_ratest_other_currencies')}
            style={{
              marginRight: '20px',
              padding: '10px 20px',
              backgroundColor: metric === 'loan_ratest_other_currencies' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            В другой валюте
          </button>

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
            Столбчатый
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
          {metricNames[metric]} с {String(fromDate.getMonth() + 1).padStart(2, '0')}.{fromDate.getFullYear()} по {String(toDate.getMonth() + 1).padStart(2, '0')}.{toDate.getFullYear()} (Россия) | 
          {aggregation === 'month' ? ` Месяцев: ${data.length}` : ` Лет: ${data.length}`}
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

export default Page5;