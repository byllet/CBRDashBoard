import '../App.css';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import React, { useState } from 'react';

const testData = [
  { name: 'Январь', value: 400 },
  { name: 'Февраль', value: 300 },
  { name: 'Март', value: 600 },
  { name: 'Апрель', value: 800 },
  { name: 'Май', value: 500 },
];

const tableRows = testData.map((item, index) => ({
  id: index + 1,       
  ...item               
}));

const columns = Object.keys(testData[0]).map((key) => ({
  field: key,
  headerName: key === 'name' ? 'Название' : 'Значение',
  width: key === 'name' ? 200 : 150,
}));

function Page1() {
  const [chartType, setChartType] = useState('line'); 

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={testData} isAnimationActive={false}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip isAnimationActive={false} position={{ x: 'auto', y: 0 }} />
          <Line type="monotone" dataKey="value" stroke="#8884d8" isAnimationActive={false} />
        </LineChart>
      );
    }
    else{
    return (
      <BarChart data={testData} isAnimationActive={false}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip isAnimationActive={false} position={{ x: 'auto', y: 0 }} />
        <Bar dataKey="value" fill="#8884d8" isAnimationActive={false} />
      </BarChart>
    );
    }
  };

  return (
    <div className="Page1">
      <h1>Курс валют</h1>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'right', marginBottom: '20px' }}>
        <button 
          onClick={() => setChartType('line')}
          style={{
            padding: '8px 16px',
            backgroundColor: chartType === 'line' ? '#8884d8' : '#e0e0e0',
            color: chartType === 'line' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Линейный график
        </button>
        <button 
          onClick={() => setChartType('histogram')}
          style={{
            padding: '8px 16px',
            backgroundColor: chartType === 'histogram' ? '#8884d8' : '#e0e0e0',
            color: chartType === 'histogram' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Гистограмма
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        {renderChart()}
      </ResponsiveContainer>

      <h2>Таблица</h2>
      
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={tableRows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5]}
        />
      </div>
    </div>
  );
}

export default Page1;