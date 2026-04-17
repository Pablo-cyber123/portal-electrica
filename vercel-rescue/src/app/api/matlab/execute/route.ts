import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Chart data types
interface ChartSeries { name: string; color: string; dataKey: string; }
interface ChartData {
  type: "line" | "bar" | "area";
  title: string;
  xLabel: string;
  yLabel: string;
  series: ChartSeries[];
  data: Record<string, number>[];
}

// ─── RLC Simulator Data ──────────────────────────────────────────────────────
function generateRLCData(): { output: string; charts: ChartData[] } {
  const R = 10, L = 0.1, C = 100e-6, V0 = 12;
  const alpha = R / (2 * L);
  const omega0 = 1 / Math.sqrt(L * C);
  const dampingRatio = alpha / omega0;
  const omega_d = Math.sqrt(Math.abs(omega0 ** 2 - alpha ** 2));

  const N = 80;
  const tMax = 0.05;
  const currentData: Record<string, number>[] = [];
  const voltageData: Record<string, number>[] = [];

  let prevI = 0;
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * tMax;
    let current = (V0 / (omega_d * L)) * Math.exp(-alpha * t) * Math.sin(omega_d * t);
    const vR = R * current;
    const vL = i === 0 ? V0 : L * ((current - prevI) / (tMax / N));
    const vC = V0 - vR - vL;
    prevI = current;
    const timeMs = parseFloat((t * 1000).toFixed(2));
    currentData.push({ timeMs, "Corriente (mA)": parseFloat((current * 1000).toFixed(3)) });
    voltageData.push({ timeMs, "V_R": parseFloat(vR.toFixed(3)), "V_L": parseFloat(vL.toFixed(3)), "V_C": parseFloat(vC.toFixed(3)) });
  }

  return {
    output: `=== Resultados del Circuito RLC en Serie ===
R = ${R} Ω   |   L = ${L} H   |   C = ${(C * 1e6).toFixed(0)} µF
Voltaje fuente: ${V0} V

Frecuencia natural (ω₀): ${omega0.toFixed(2)} rad/s
Factor de amortiguamiento (ζ): ${dampingRatio.toFixed(4)}
Frecuencia oscilación (ω_d): ${omega_d.toFixed(2)} rad/s
Tipo de respuesta: Sub-amortiguado

Corriente pico: ${((V0 / (omega_d * L)) * Math.exp(-alpha * (1 / omega_d)) * Math.sin(1) * 1000).toFixed(3)} mA
Tiempo de pico estimado: ${((Math.PI / 2) / omega_d * 1000).toFixed(2)} ms`,
    charts: [
      {
        type: "line",
        title: "Corriente Transitoria i(t)",
        xLabel: "Tiempo (ms)",
        yLabel: "Corriente (mA)",
        series: [{ name: "Corriente (mA)", color: "#3b82f6", dataKey: "Corriente (mA)" }],
        data: currentData,
      },
      {
        type: "line",
        title: "Voltajes en Componentes",
        xLabel: "Tiempo (ms)",
        yLabel: "Voltaje (V)",
        series: [
          { name: "V_R (Resistor)", color: "#ef4444", dataKey: "V_R" },
          { name: "V_L (Inductor)", color: "#22c55e", dataKey: "V_L" },
          { name: "V_C (Capacitor)", color: "#a855f7", dataKey: "V_C" },
        ],
        data: voltageData,
      },
    ],
  };
}

// ─── Fourier Transform Data ───────────────────────────────────────────────────
function generateFourierData(): { output: string; charts: ChartData[] } {
  const Fs = 1000, N = 512;
  const freqs = [50, 120, 200];
  const amps = [1.0, 0.5, 0.3];
  const spectrumData: Record<string, number>[] = [];

  // Generate FFT magnitude approximation
  for (let k = 0; k <= 300; k++) {
    let mag = 0;
    for (let i = 0; i < freqs.length; i++) {
      const width = 5;
      const diff = Math.abs(k - freqs[i]);
      if (diff < width) mag += amps[i] * Math.exp(-(diff ** 2) / 4);
    }
    mag += Math.random() * 0.02; // noise
    spectrumData.push({ "Freq (Hz)": k, "Magnitud |X(f)|": parseFloat(mag.toFixed(4)) });
  }

  // Time domain approximation
  const timeDomain: Record<string, number>[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = (i / 80) * 0.04;
    let s = 0;
    for (let j = 0; j < freqs.length; j++) s += amps[j] * Math.sin(2 * Math.PI * freqs[j] * t);
    s += (Math.random() - 0.5) * 0.2;
    timeDomain.push({ "Tiempo (ms)": parseFloat((t * 1000).toFixed(2)), "Amplitud": parseFloat(s.toFixed(4)) });
  }

  return {
    output: `=== Análisis Espectral — Transformada de Fourier ===
Frecuencia de muestreo: ${Fs} Hz
Número de muestras: ${N}

Componentes detectadas:
  ► f₁ = 50 Hz  |  A₁ = 1.000
  ► f₂ = 120 Hz |  A₂ = 0.500
  ► f₃ = 200 Hz |  A₃ = 0.300

Ruido añadido: σ = 0.2 (Gaussiano)
Resolución espectral: ${(Fs / N).toFixed(2)} Hz/bin`,
    charts: [
      {
        type: "line",
        title: "Señal en el Dominio del Tiempo",
        xLabel: "Tiempo (ms)",
        yLabel: "Amplitud",
        series: [{ name: "Señal x(t)", color: "#3b82f6", dataKey: "Amplitud" }],
        data: timeDomain,
      },
      {
        type: "area",
        title: "Espectro de Magnitud (FFT)",
        xLabel: "Frecuencia (Hz)",
        yLabel: "|X(f)|",
        series: [{ name: "Magnitud", color: "#f59e0b", dataKey: "Magnitud |X(f)|" }],
        data: spectrumData,
      },
    ],
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId } = await req.json();
  if (!projectId) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const project = await prisma.matlabProject.findUnique({
    where: { id: projectId },
    select: { title: true }, // code never sent to client
  });

  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  // Simulate processing delay
  await new Promise(r => setTimeout(r, 1800));

  let result: { output: string; charts: ChartData[] };

  if (project.title.includes("RLC")) {
    result = generateRLCData();
  } else if (project.title.includes("Fourier")) {
    result = generateFourierData();
  } else {
    result = {
      output: `>> Programa ejecutado con éxito.\n>> Variables inicializadas.\n>> Análisis completado.`,
      charts: [],
    };
  }

  return NextResponse.json({
    success: true,
    title: project.title,
    output: result.output,
    charts: result.charts,
    exitCode: 0,
  });
}
