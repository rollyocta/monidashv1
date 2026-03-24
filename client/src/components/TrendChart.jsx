import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          
          <XAxis 
            dataKey="name" 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            tick={{ dy: 10 }}
          />
          
          <YAxis 
            stroke="#475569" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `₱${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
          />
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#020617', 
              border: '1px solid #1e293b', 
              borderRadius: '4px', 
              fontSize: '10px',
              fontFamily: 'monospace'
            }}
            itemStyle={{ padding: '2px 0' }}
            cursor={{ stroke: '#22d3ee', strokeWidth: 1 }}
          />
          
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#06b6d4" 
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            strokeWidth={2}
            animationDuration={1000}
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorExpense)" 
            strokeWidth={2}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;