import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Charts({points}){
  const data = points.map(p => ({time: new Date(p.ts).toLocaleTimeString(), value: Number(p.state.state)}))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#3f51b5" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
