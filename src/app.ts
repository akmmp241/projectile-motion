const PIXELS_PER_METER = 10; // 1 Meter = 10 Pixel

// posisi (0, 0) pada layar
const ORIGIN = { x: 100, y: 550 };

type Vector2 = {
  x: number
  y: number
}

type CheckPoint = {
  time: number
  pos: Vector2
}

const createVector = (x: number, y: number): Vector2 => ({x, y})

// gapake lerp dulu karna too much complexity
// linear interpolation
// const lerp = (start: number, end: number, t: number): number => {
//   return start + (end - start) * t;
// };

const generatePath = (startX: number, startY: number, duration: number, g: number, theta: number, v0: number, a: number): CheckPoint[] => {
  const path: CheckPoint[] = [];

  const v = v0 // m/s
  const gravity = g // m/s
  const acceleration = a // m/s

  const vx = v * Math.cos(theta * (Math.PI / 180)) // m/s
  const vy = v * Math.sin(theta * (Math.PI / 180)) * -1// m/s


  const timeStep = 0.1
  for (let t = 0; t <= duration; t += timeStep) {

    // X = X0 + Vx * t + 0.5 + a + t^2
    const x = startX + (vx * t) + (0.5 * acceleration * (t * t));

    // Y = Y0 + Vy * t + 0.5 * g * t^2
    const y = startY + (vy * t) + (0.5 * gravity * (t * t));

    path.push({
      time: t,
      pos: createVector(x, y)
    });
  }
  return path;
};

const getPositionAtTime = (path: CheckPoint[], currentTime: number): Vector2 => {
  const lastPoint = path[path.length - 1] as CheckPoint;

  if (currentTime >= lastPoint.time) return lastPoint.pos;
  if (currentTime <= 0) return path[0]?.pos as Vector2;

  const timeStep = 0.1
  const rawIndex = currentTime / timeStep

  let indexA = Math.floor(rawIndex);

  if (indexA < 0) indexA = 0;
  if (indexA >= path.length - 1) indexA = path.length - 2;

  return path[indexA]?.pos as Vector2

  // KOMPONEN LERP
  // const indexB = indexA + 1;

  // const pointA = path[indexA] as CheckPoint;
  // const pointB = path[indexB] as CheckPoint;
  //
  // const t = rawIndex - indexA;
  //
  // const currentX = lerp(pointA.pos.x, pointB.pos.x, t);
  // const currentY = lerp(pointA.pos.y, pointB.pos.y, t);
  //
  // return createVector(currentX, currentY);
};

const draw = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, relativePos: Vector2, path: CheckPoint[], width: number, height: number) => {
  ctx.clearRect(0, 0, width, height);

  drawCartesianAxes(ctx, width, height);

  ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
  path.forEach(p => {
    const screenX = ORIGIN.x + (p.pos.x * PIXELS_PER_METER);
    const screenY = ORIGIN.y + (p.pos.y * PIXELS_PER_METER);

    ctx.fillRect(screenX - 2, screenY - 2, 8, 8);
  });

  const screenX = ORIGIN.x + relativePos.x * PIXELS_PER_METER;
  const screenY = ORIGIN.y + relativePos.y * PIXELS_PER_METER;

  const size = 30;
  ctx.drawImage(img, screenX - (size/2), screenY - (size/2), size, size);

  const meterX = (relativePos.x).toFixed(2);
  const meterY = ((relativePos.y)).toFixed(2); // Y positif ke bawah (Canvas standard)

  ctx.fillStyle = "#231111";
  ctx.textAlign = "left";
  ctx.fillText(`x: ${meterX}m`, screenX + 20, screenY);
  ctx.fillText(`y: ${meterY}m`, screenX + 20, screenY + 15);
};

const main = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');
  const times = document.getElementById('times') as HTMLInputElement;
  const label = document.getElementById('timeDisplay') as HTMLInputElement;
  const gravity = document.getElementById('gravity') as HTMLInputElement;
  const theta = document.getElementById('theta') as HTMLInputElement;
  const initialVel = document.getElementById('v-x-awal') as HTMLInputElement;
  const acceleration = document.getElementById('a') as HTMLInputElement;

  if (!canvas || !ctx || !times || !gravity || !theta || !initialVel || !acceleration) return;

  // - 120 karena dikurangi sama padding
  canvas.width = window.innerWidth - 120;
  canvas.height = window.innerHeight - 120;

  const img = new Image();
  img.src = './bola.png';

  img.onload = () => {
    let currentPath: CheckPoint[] = [];

    const renderWithNewPath = () => {
      const g = parseFloat(gravity.value) || 10.0
      const t = parseFloat(theta.value) || 30.0
      const v0 = parseFloat(initialVel.value) || 15.0
      const a = parseFloat(acceleration.value)

      currentPath = generatePath(0, 0, 100, g, t, v0, a);

      renderFrame()
    }

    const renderFrame = () => {
      const val = parseFloat(times.value)

      const timeInSeconds = val / 10;

      label.innerText = timeInSeconds.toFixed(1) + "s";

      const currentPos = getPositionAtTime(currentPath, timeInSeconds);

      draw(ctx, img, currentPos, currentPath, canvas.width, canvas.height);
    };

    renderWithNewPath()
    times.addEventListener('input', renderFrame);

    gravity.addEventListener('change', renderWithNewPath);
    theta.addEventListener('change', renderWithNewPath);
    initialVel.addEventListener('change', renderWithNewPath);
    acceleration.addEventListener('change', renderWithNewPath);

    renderFrame();
  };
};

document.addEventListener('DOMContentLoaded', main);





// code below ofc made by ai




// --- 3. VISUAL GRID SYSTEM (PENGGARIS) ---
const drawCartesianAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = '#000000'; // Warna teks abu terang
  ctx.font = "10px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // --- A. GAMBAR GARIS SUMBU UTAMA ---
  ctx.beginPath();

  // Garis Horizontal (Sumbu X) - Sepanjang layar melewati ORIGIN.y
  ctx.moveTo(0, ORIGIN.y);
  ctx.lineTo(width, ORIGIN.y);

  // Garis Vertikal (Sumbu Y) - Sepanjang layar melewati ORIGIN.x
  ctx.moveTo(ORIGIN.x, 0);
  ctx.lineTo(ORIGIN.x, height);

  ctx.stroke();

  // --- B. LABEL & TICK MARK PADA SUMBU X ---
  // Loop ke KANAN dari origin (Nilai Positif)
  for (let x = ORIGIN.x; x < width; x += PIXELS_PER_METER) {
    const dist = x - ORIGIN.x; // Jarak pixel dari pusat
    const meter = dist / PIXELS_PER_METER;

    drawTickX(ctx, x, meter);
  }
  // --- C. LABEL & TICK MARK PADA SUMBU Y ---
  // Loop ke BAWAH dari origin (Nilai Positif di Canvas)
  for (let y = ORIGIN.y; y < height; y += PIXELS_PER_METER) {
    const dist = y - ORIGIN.y;
    const meter = (dist / PIXELS_PER_METER) * -1 ;
    drawTickY(ctx, y, meter);
  }
  // Loop ke ATAS dari origin (Nilai Negatif)
  for (let y = ORIGIN.y; y > 0; y -= PIXELS_PER_METER) {
    const dist = y - ORIGIN.y;
    const meter = (dist / PIXELS_PER_METER) * -1;
    drawTickY(ctx, y, meter);
  }

  // Label Titik Nol
  ctx.fillText("(0,0)", ORIGIN.x - 15, ORIGIN.y + 15);
};

// Helper kecil untuk gambar strip di sumbu X
const drawTickX = (ctx: CanvasRenderingContext2D, x: number, val: number) => {
  if (val === 0) return; // Jangan gambar di titik pusat lagi
  const isMajor = Math.abs(val) % 5 === 0;
  const height = isMajor ? 10 : 4;

  ctx.beginPath();
  ctx.moveTo(x, ORIGIN.y - height/2);
  ctx.lineTo(x, ORIGIN.y + height/2);
  ctx.stroke();

  if (isMajor) ctx.fillText(val.toString(), x, ORIGIN.y + 15);
};

// Helper kecil untuk gambar strip di sumbu Y
const drawTickY = (ctx: CanvasRenderingContext2D, y: number, val: number) => {
  if (val === 0) return;
  const isMajor = Math.abs(val) % 5 === 0;
  const width = isMajor ? 10 : 4;

  ctx.beginPath();
  ctx.moveTo(ORIGIN.x - width/2, y);
  ctx.lineTo(ORIGIN.x + width/2, y);
  ctx.stroke();

  if (isMajor) ctx.fillText(val.toString(), ORIGIN.x - 20, y);
};