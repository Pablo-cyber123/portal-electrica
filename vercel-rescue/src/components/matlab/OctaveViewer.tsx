"use client"

import { useState, useEffect } from "react"
import {
  Play, RotateCw, Terminal, CheckCircle, XCircle, Loader2, Cpu, Shield, BarChart2
} from "lucide-react"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts"

// ─── Types ──────────────────────────────────────────────────────────────────
interface ChartSeries { name: string; color: string; dataKey: string }
interface ChartData {
  type: "line" | "bar" | "area"
  title: string
  xLabel: string
  yLabel: string
  series: ChartSeries[]
  data: Record<string, number>[]
}

interface ExecutionResult {
  output: string
  charts: ChartData[]
  exitCode: number
}

// ─── Chart Renderer ──────────────────────────────────────────────────────────
function ChartPanel({ chart }: { chart: ChartData }) {
  const tooltipStyle = {
    borderRadius: "8px", border: "none",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)", fontSize: "12px"
  }

  const renderChart = () => {
    if (chart.type === "area") {
      return (
        <AreaChart data={chart.data} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey={Object.keys(chart.data[0] ?? {})[0]} tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#374151" label={{ value: chart.xLabel, position: "insideBottom", offset: -10, fontSize: 10, fill: "#6b7280" }} />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#374151" label={{ value: chart.yLabel, angle: -90, position: "insideLeft", fontSize: 10, fill: "#6b7280" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          {chart.series.map(s => (
            <Area key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color} fill={s.color} fillOpacity={0.15} strokeWidth={2} dot={false} name={s.name} />
          ))}
        </AreaChart>
      )
    }

    if (chart.type === "bar") {
      return (
        <BarChart data={chart.data} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey={Object.keys(chart.data[0] ?? {})[0]} tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#374151" />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#374151" />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          {chart.series.map(s => (
            <Bar key={s.dataKey} dataKey={s.dataKey} fill={s.color} name={s.name} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      )
    }

    return (
      <LineChart data={chart.data} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey={Object.keys(chart.data[0] ?? {})[0]} tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#374151" label={{ value: chart.xLabel, position: "insideBottom", offset: -10, fontSize: 10, fill: "#6b7280" }} />
        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} stroke="#374151" label={{ value: chart.yLabel, angle: -90, position: "insideLeft", fontSize: 10, fill: "#6b7280" }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
        {chart.series.map(s => (
          <Line key={s.dataKey} type="monotone" dataKey={s.dataKey} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} name={s.name} />
        ))}
      </LineChart>
    )
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-gray-800 p-4">
      <p className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
        <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
        {chart.title}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 bg-[#0d1117]">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-green-900/30 border-t-green-400 animate-spin" />
        <Cpu className="w-6 h-6 text-green-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-white mb-1">Ejecutando código Matlab...</p>
        <p className="text-xs text-gray-500">El servidor está procesando</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OctaveViewer({ projectId, title }: { projectId: string; title: string }) {
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const hasCharts = (result?.charts?.length ?? 0) > 0

  const executeCode = async () => {
    setExecuting(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/matlab/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error desconocido")
        return
      }

      setResult({
        output: data.output || "(Sin salida de texto)",
        charts: data.charts || [],
        exitCode: data.exitCode ?? 0,
      })
    } catch (err: any) {
      setError(err.message || "Error de conexión")
    } finally {
      setExecuting(false)
    }
  }

  // Auto-execute on mount
  useEffect(() => { executeCode() }, [])

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-[#161b22] border-b border-gray-800 px-4 py-2.5 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold text-white truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-500 bg-[#0d1117] px-2 py-1 rounded-lg border border-gray-800">
            <Shield className="w-3 h-3 text-green-500" /> Código Protegido
          </span>
          <button onClick={executeCode} disabled={executing}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-700 hover:bg-green-600 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors">
            {executing
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Ejecutando...</>
              : <><Play className="w-3 h-3" /> Ejecutar</>}
          </button>
          {result && (
            <button onClick={executeCode} disabled={executing}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-[#0d1117] hover:bg-gray-800 border border-gray-800 px-2.5 py-1.5 rounded-lg transition-colors">
              <RotateCw className="w-3 h-3" /> Re-ejecutar
            </button>
          )}
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────────── */}
      {result && (
        <div className={`flex items-center gap-2 px-4 py-1 text-[11px] font-medium border-b shrink-0 ${
          result.exitCode === 0
            ? "bg-green-950/40 border-green-900/40 text-green-400"
            : "bg-amber-950/40 border-amber-900/40 text-amber-400"
        }`}>
          {result.exitCode === 0
            ? <><CheckCircle className="w-3 h-3" /> Ejecución exitosa</>
            : <><XCircle className="w-3 h-3" /> Ejecución con advertencias</>}
          {hasCharts && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-500">
              <BarChart2 className="w-3 h-3" /> {result.charts.length} gráfica{result.charts.length > 1 ? "s" : ""} generada{result.charts.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────────────── */}
      {executing && !result ? (
        <div className="flex-1">
          <LoadingState />
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0d1117]">
          <XCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={executeCode} className="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
            Reintentar
          </button>
        </div>
      ) : result ? (
        // ─── SPLIT PANEL ─────────────────────────────────────────────────
        <div className={`flex-1 flex ${hasCharts ? "flex-col lg:flex-row" : ""} overflow-hidden min-h-0`}>
          
          {/* LEFT — Terminal Output */}
          <div className={`${hasCharts ? "lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-800" : "w-full"} flex flex-col overflow-hidden`}>
            <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-gray-800 shrink-0">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Salida del Programa</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#0d1117]">
              <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap leading-relaxed">
                {result.output}
              </pre>
            </div>
          </div>

          {/* RIGHT — Charts Panel (only if charts exist) */}
          {hasCharts && (
            <div className="lg:w-1/2 flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-gray-800 shrink-0">
                <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Visualización Gráfica</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1117]">
                {result.charts.map((chart, idx) => (
                  <ChartPanel key={idx} chart={chart} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0d1117]">
          <Play className="w-10 h-10 text-gray-700" />
          <p className="text-sm text-gray-600">Presiona <strong className="text-white">Ejecutar</strong> para iniciar</p>
        </div>
      )}
    </div>
  )
}
