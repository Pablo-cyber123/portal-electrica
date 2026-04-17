"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Zap, Activity, Settings2, Calculator } from "lucide-react"

export default function NativeRLCCalculator() {
  const [resistance, setResistance] = useState<number>(10)
  const [inductance, setInductance] = useState<number>(0.1) // H
  const [capacitance, setCapacitance] = useState<number>(100) // uF
  const [voltage, setVoltage] = useState<number>(12)

  // Hydration fix
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Calculate generic math properties
  const mathProps = useMemo(() => {
    const R = Number(resistance) || 0.1
    const L = Number(inductance) || 0.001
    const C = (Number(capacitance) || 1) * 1e-6
    const V0 = Number(voltage) || 0

    const alpha = R / (2 * L)
    const omega0 = 1 / Math.sqrt(L * C)
    const dampingRatio = alpha / omega0

    let type = ""
    if (dampingRatio < 1) type = "Sub-amortiguado"
    else if (dampingRatio === 1) type = "Críticamente amortiguado"
    else type = "Sobre-amortiguado"

    return { R, L, C, V0, alpha, omega0, dampingRatio, type }
  }, [resistance, inductance, capacitance, voltage])

  // Calculate Data for charts
  const chartData = useMemo(() => {
    const { R, L, alpha, omega0, dampingRatio, V0 } = mathProps
    const data = []
    
    // Simulate 50ms (0.05s) with 100 points
    const dt = 0.05 / 100
    let prevI = 0

    for (let i = 0; i <= 100; i++) {
        const t = i * dt
        let current = 0

        if (dampingRatio < 1) {
            // Sub-damped
            const omega_d = Math.sqrt(omega0 * omega0 - alpha * alpha)
            current = (V0 / (omega_d * L)) * Math.exp(-alpha * t) * Math.sin(omega_d * t)
        } else if (dampingRatio === 1) {
            // Critical
            current = (V0 / L) * t * Math.exp(-alpha * t)
        } else {
            // Over-damped
            const s1 = -alpha + Math.sqrt(alpha * alpha - omega0 * omega0)
            const s2 = -alpha - Math.sqrt(alpha * alpha - omega0 * omega0)
            current = (V0 / (L * (s1 - s2))) * (Math.exp(s1 * t) - Math.exp(s2 * t))
        }

        const Vr = R * current
        
        // Approximate Vl = L * di/dt
        const Vl = i === 0 ? V0 : L * ((current - prevI) / dt)
        const Vc = V0 - Vr - Vl

        prevI = current

        data.push({
            timeMs: Number((t * 1000).toFixed(1)),
            corriente_mA: Number((current * 1000).toFixed(2)),
            VR: Number(Vr.toFixed(2)),
            VL: Number(Vl.toFixed(2)),
            VC: Number(Vc.toFixed(2))
        })
    }
    return data
  }, [mathProps])

  if (!mounted) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border border-oxfordGrey-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600/10 to-indigo-400/10">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-oxfordGrey-900 truncate">Herramienta Nativa — Calculadora RLC</h1>
            <p className="text-xs text-oxfordGrey-400 truncate">Ejecución instantánea con gráficas y entrada de datos en tiempo real.</p>
          </div>
        </div>
        <a
          href="/dashboard/herramientas"
          className="text-xs font-semibold text-oxfordGrey-500 hover:text-utsGreen-800 bg-oxfordGrey-100 hover:bg-oxfordGrey-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          ← Volver
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel de Controles */}
        <Card className="col-span-1 border-oxfordGrey-200 shadow-sm">
          <CardHeader className="bg-oxfordGrey-50 border-b border-oxfordGrey-100 pb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-utsGreen-800" /> Parámetros de Entrada
            </CardTitle>
            <p className="text-xs text-oxfordGrey-500 mt-1.5">
              Modifica los valores y observa la gráfica actualizarse instanteamente.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-oxfordGrey-700">Voltaje Fuente (V)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="1" max="120" value={voltage} 
                  onChange={e => setVoltage(Number(e.target.value))}
                  className="flex-1 accent-utsGreen-600" 
                />
                <input 
                  type="number" value={voltage} onChange={e => setVoltage(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border rounded text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-oxfordGrey-700">Resistencia (Ω)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="1" max="100" value={resistance} 
                  onChange={e => setResistance(Number(e.target.value))}
                  className="flex-1 accent-red-500" 
                />
                <input 
                  type="number" value={resistance} onChange={e => setResistance(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border rounded text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-oxfordGrey-700">Inductancia (H)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="0.01" max="2" step="0.01" value={inductance} 
                  onChange={e => setInductance(Number(e.target.value))}
                  className="flex-1 accent-green-500" 
                />
                <input 
                  type="number" step="0.01" value={inductance} onChange={e => setInductance(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border rounded text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-oxfordGrey-700">Capacitancia (µF)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" min="1" max="500" value={capacitance} 
                  onChange={e => setCapacitance(Number(e.target.value))}
                  className="flex-1 accent-blue-500" 
                />
                <input 
                  type="number" value={capacitance} onChange={e => setCapacitance(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-sm border rounded text-right"
                />
              </div>
            </div>

            {/* Resultados Numéricos */}
            <div className="mt-6 pt-4 border-t border-oxfordGrey-100 space-y-2 bg-oxfordGrey-50 p-3 rounded-lg">
               <div className="flex justify-between text-xs">
                 <span className="text-oxfordGrey-500 font-medium">Frecuencia Nat (ω0):</span>
                 <span className="font-mono text-oxfordGrey-900">{mathProps.omega0.toFixed(2)} rad/s</span>
               </div>
               <div className="flex justify-between text-xs">
                 <span className="text-oxfordGrey-500 font-medium">Factor Amortiguamiento:</span>
                 <span className="font-mono text-oxfordGrey-900">{mathProps.dampingRatio.toFixed(3)}</span>
               </div>
               <div className="flex justify-between text-xs items-center pt-1 border-t border-oxfordGrey-200">
                 <span className="text-oxfordGrey-500 font-medium">Sistema:</span>
                 <span className={`font-bold px-2 py-1 rounded text-[10px] uppercase tracking-wider
                    ${mathProps.dampingRatio < 1 ? 'bg-amber-100 text-amber-800' : 
                      mathProps.dampingRatio === 1 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                   {mathProps.type}
                 </span>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel de Gráficas */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          
          <Card className="border-oxfordGrey-200 shadow-sm">
            <CardHeader className="py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Activity className="w-4 h-4 text-blue-600" /> Corriente Transitoria (mA)
               </CardTitle>
            </CardHeader>
            <CardContent className="h-64 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="timeMs" tick={{ fontSize: 12 }} stroke="#9ca3af" label={{ value: "Tiempo (ms)", position: "insideBottomRight", offset: -5, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => `t: ${val} ms`}
                  />
                  <Line type="monotone" dataKey="corriente_mA" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6 }} name="Corriente (mA)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-oxfordGrey-200 shadow-sm">
            <CardHeader className="py-4">
               <CardTitle className="text-sm font-bold flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-500" /> Voltajes en Componentes (V)
               </CardTitle>
            </CardHeader>
            <CardContent className="h-64 px-2">
               <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="timeMs" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => `t: ${val} ms`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Line type="monotone" dataKey="VR" stroke="#ef4444" strokeWidth={2} dot={false} name="Vol Resistador" />
                  <Line type="monotone" dataKey="VL" stroke="#22c55e" strokeWidth={2} dot={false} name="Vol Inductor" />
                  <Line type="monotone" dataKey="VC" stroke="#a855f7" strokeWidth={2} dot={false} name="Vol Capacitor" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
