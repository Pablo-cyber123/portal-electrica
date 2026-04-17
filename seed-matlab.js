require('dotenv').config({ path: '.env.production' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  try {
    // Get teacher user
    const teacher = await prisma.user.findUnique({ where: { email: 'profesor@uts.edu.co' } });

    await prisma.matlabProject.create({
      data: {
        title: "Simulador de Circuito RLC en Serie",
        description: "Herramienta de simulación para analizar el comportamiento transitorio de un circuito RLC en serie. Permite modificar los valores de resistencia, inductancia y capacitancia para observar cómo el sistema responde ante una señal escalón.",
        functionality: "Calcula y grafica la respuesta transitoria del circuito RLC: sobreamortiguado, críticamente amortiguado y subamortiguado. Muestra la corriente y el voltaje en cada componente a lo largo del tiempo. Ideal para comprender la dinámica de circuitos de segundo orden.",
        code: `% Simulador de Circuito RLC en Serie
% Ingenieria Electrica - UTS

% Parametros del circuito
R = 10;      % Resistencia (Ohms)
L = 0.1;     % Inductancia (Henrios)
C = 100e-6;  % Capacitancia (Faradios)
V0 = 12;     % Voltaje de la fuente (Voltios)

% Calculo de parametros
alpha = R / (2*L);
omega0 = 1 / sqrt(L*C);
omega_d = sqrt(abs(omega0^2 - alpha^2));

% Vector de tiempo
t = linspace(0, 0.05, 1000);

% Respuesta del circuito
if alpha < omega0
    % Sub-amortiguado
    i = (V0/omega_d/L) * exp(-alpha*t) .* sin(omega_d*t);
    tipo = 'Sub-amortiguado';
elseif alpha == omega0
    % Criticamente amortiguado
    i = (V0/L) * t .* exp(-alpha*t);
    tipo = 'Criticamente Amortiguado';
else
    % Sobre-amortiguado
    s1 = -alpha + sqrt(alpha^2 - omega0^2);
    s2 = -alpha - sqrt(alpha^2 - omega0^2);
    i = (V0/L/(s1-s2)) * (exp(s1*t) - exp(s2*t));
    tipo = 'Sobre-amortiguado';
end

% Voltajes en cada componente
v_R = R * i;
v_L = L * gradient(i, t(2)-t(1));
v_C = V0 - v_R - v_L;

% Graficar resultados
figure;
subplot(2,1,1);
plot(t*1000, i*1000, 'b', 'LineWidth', 2);
xlabel('Tiempo (ms)');
ylabel('Corriente (mA)');
title(['Respuesta del Circuito RLC - ', tipo]);
grid on;

subplot(2,1,2);
plot(t*1000, v_R, 'r', t*1000, v_L, 'g', t*1000, v_C, 'm', 'LineWidth', 1.5);
xlabel('Tiempo (ms)');
ylabel('Voltaje (V)');
legend('V_R', 'V_L', 'V_C');
title('Voltajes en los Componentes');
grid on;

fprintf('=== Resultados del Circuito RLC ===\\n');
fprintf('R = %.1f Ohms, L = %.4f H, C = %.2f uF\\n', R, L, C*1e6);
fprintf('Frecuencia natural: %.2f rad/s\\n', omega0);
fprintf('Factor de amortiguamiento: %.2f\\n', alpha/omega0);
fprintf('Tipo de respuesta: %s\\n', tipo);`,
        fileName: "simulador_rlc.m",
        uploaderId: teacher.id,
      }
    });

    await prisma.matlabProject.create({
      data: {
        title: "Calculadora de Transformada de Fourier",
        description: "Herramienta para calcular y visualizar la Transformada Discreta de Fourier (DFT) de señales compuestas. Permite combinar múltiples frecuencias y analizar el espectro resultante.",
        functionality: "Genera una señal compuesta a partir de múltiples sinusoides con frecuencias y amplitudes configurables. Calcula la FFT y muestra el espectro de magnitud y fase. Útil para el análisis espectral de señales en laboratorio.",
        code: `% Calculadora de Transformada de Fourier
% Ingenieria Electrica - UTS

% Parametros de muestreo
Fs = 1000;          % Frecuencia de muestreo (Hz)
T = 1/Fs;           % Periodo de muestreo
N = 1024;           % Numero de muestras
t = (0:N-1)*T;      % Vector de tiempo

% Senales componentes
f1 = 50; A1 = 1.0;   % 50 Hz, amplitud 1.0
f2 = 120; A2 = 0.5;  % 120 Hz, amplitud 0.5
f3 = 200; A3 = 0.3;  % 200 Hz, amplitud 0.3

% Senal compuesta con ruido
x = A1*sin(2*pi*f1*t) + A2*sin(2*pi*f2*t) + A3*sin(2*pi*f3*t);
x = x + 0.2*randn(size(t));  % Agregar ruido

% Calcular FFT
Y = fft(x);
P2 = abs(Y/N);
P1 = P2(1:N/2+1);
P1(2:end-1) = 2*P1(2:end-1);
f = Fs*(0:(N/2))/N;

% Fase
phase = angle(Y(1:N/2+1)) * 180/pi;

% Graficar
figure;
subplot(3,1,1);
plot(t*1000, x, 'b');
xlabel('Tiempo (ms)');
ylabel('Amplitud');
title('Senal en el dominio del tiempo');
grid on;

subplot(3,1,2);
stem(f, P1, 'r', 'LineWidth', 1.5);
xlabel('Frecuencia (Hz)');
ylabel('|X(f)|');
title('Espectro de Magnitud (FFT)');
xlim([0 300]);
grid on;

subplot(3,1,3);
plot(f, phase, 'g', 'LineWidth', 1.5);
xlabel('Frecuencia (Hz)');
ylabel('Fase (grados)');
title('Espectro de Fase');
xlim([0 300]);
grid on;

fprintf('=== Analisis Espectral ===\\n');
fprintf('Frecuencias detectadas: %d Hz, %d Hz, %d Hz\\n', f1, f2, f3);
fprintf('Frecuencia de muestreo: %d Hz\\n', Fs);`,
        fileName: "transformada_fourier.m",
        uploaderId: teacher.id,
      }
    });

    console.log("✅ 2 proyectos Matlab de prueba creados exitosamente!");

  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
    pool.end();
  }
}
seed();
