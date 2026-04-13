import '../App.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#ff6b6b'];

const columns = Object.keys(testData[0]).map((key) => ({
    field: key,
    headerName: key === 'name' ? 'Название' : 'Значение',
    width: key === 'name' ? 200 : 150,
}));

function Page4() {
    const [chartType, setChartType] = useState('histogram');

    const renderChart = () => {
        if (chartType === 'histogram') {
            return (
                <BarChart data={testData} isAnimationActive={false}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip isAnimationActive={false} position={{ x: 'auto', y: 0 }} />
                    <Bar dataKey="value" fill="#8884d8" isAnimationActive={false} />
                </BarChart>
            );
        }
        else {
            return (
                <PieChart>
                    <Pie
                        data={testData}
                        dataKey="value"           
                        nameKey="name"            
                        cx="50%"                  
                        cy="50%"                  
                        outerRadius={80}          
                        innerRadius={0}
                        fill="#f4f3ff"
                        // stroke="black"           
                        label={{ fill: 'black' }}                     
                        isAnimationActive={false}
                    >
                        {testData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip isAnimationActive={false} />
                </PieChart>

            );
        }
    };

    return (
        <div className="Page4">
            <h1>Ставки по депозитам</h1>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'right', marginBottom: '20px' }}>
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
                <button
                    onClick={() => setChartType('pie')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: chartType === 'pie' ? '#8884d8' : '#e0e0e0',
                        color: chartType === 'pie' ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Круговая диаграмма
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

export default Page4;