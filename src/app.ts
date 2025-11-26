const PIXELS_PER_METER = 10; // 1 Meter = 10 Pixel

// posisi (0, 0) pada layar
const ORIGIN = {x: 100, y: 550};

type Vector2 = {
  x: number
  y: number
}

type CheckPoint = {
  time: number
  pos: Vector2
}

type Config = {
  isControl1: boolean
}

let Config: Config = {
  isControl1: true,
}

const createVector = (x: number, y: number): Vector2 => ({x, y})

// gapake lerp dulu karna too much complexity
// linear interpolation
// const lerp = (start: number, end: number, t: number): number => {
//   return start + (end - start) * t;
// };

const generatePath = (startX: number, startY: number, duration: number, g: number, theta: number, v0: number, a: number, m: number, dragCoeff: number, initVX: number, initVY: number): CheckPoint[] => {
  const path: CheckPoint[] = [];

  const v = v0 // m/s
  const gravity = g // m/s
  const acceleration = a // m/s
  const mass = m // gram
  const dragCoefficient = dragCoeff

  let vx = initVX
  let vy = initVY * -1
  if (Config.isControl1) {
    vx = v * Math.cos(theta * (Math.PI / 180)) // m/s
    vy = v * Math.sin(theta * (Math.PI / 180)) * -1// m/s
  }
  const magnitude = Math.sqrt(vx * vx * vx + vy * vy);

  const timeStep = 0.01
  for (let t = 0; t <= duration; t += timeStep) {

    // X = X0 + Vx * t + 0.5 + a + t^2
    const x = startX + (vx * t) + (0.5 * acceleration * (t * t));

    // Y = Y0 + Vy * t + 0.5 * g * t^2
    const y = startY + (vy * t) + (0.5 * gravity * (t * t));

    if (y > 10) break

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

  const timeStep = 0.01
  const rawIndex = currentTime / timeStep

  let indexA = Math.floor(rawIndex);

  if (indexA < 0) indexA = 0;
  if (indexA >= path.length - 1) indexA = path.length - 2;

  return path[indexA]?.pos as Vector2

  // KOMPONEN LERP which is gadipake dulu
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

const drawCourt = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = '#75bf1e';
  const height = 68 * PIXELS_PER_METER;
  const length = 104 * PIXELS_PER_METER;

  ctx.fillRect(ORIGIN.x, ORIGIN.y - (height / 2), length, height)

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#000';
  ctx.beginPath()

  // center circle
  ctx.arc(ORIGIN.x + (length / 2), ORIGIN.y, 9.15 * PIXELS_PER_METER, 0, 2 * Math.PI)

  // center line
  ctx.moveTo(ORIGIN.x + (length / 2), ORIGIN.y);
  ctx.lineTo(ORIGIN.x + (length / 2), ORIGIN.y + height / 2);
  ctx.lineTo(ORIGIN.x + (length / 2), ORIGIN.y - height / 2);

  // left penalty zone
  const penaltyHeight = 16.5 * PIXELS_PER_METER;
  const penaltyLength = 40.3 * PIXELS_PER_METER;

  ctx.moveTo(ORIGIN.x, ORIGIN.y - (penaltyLength / 2));
  ctx.lineTo(ORIGIN.x + penaltyHeight, ORIGIN.y - (penaltyLength / 2));
  ctx.lineTo(ORIGIN.x + penaltyHeight, ORIGIN.y + (penaltyLength / 2));
  ctx.lineTo(ORIGIN.x, ORIGIN.y + (penaltyLength / 2));

  ctx.moveTo(ORIGIN.x, ORIGIN.y + (7.32 * PIXELS_PER_METER / 2) + (5.5 * PIXELS_PER_METER));
  ctx.lineTo(ORIGIN.x + (5.5 * PIXELS_PER_METER), ORIGIN.y + (7.32 * PIXELS_PER_METER / 2) + (5.5 * PIXELS_PER_METER))
  ctx.lineTo(ORIGIN.x + (5.5 * PIXELS_PER_METER), ORIGIN.y - (7.32 * PIXELS_PER_METER / 2) - (5.5 * PIXELS_PER_METER));
  ctx.lineTo(ORIGIN.x, ORIGIN.y - (7.32 * PIXELS_PER_METER / 2) - (5.5 * PIXELS_PER_METER))

  // right penalty zone
  ctx.moveTo(ORIGIN.x + length, ORIGIN.y - (penaltyLength / 2));
  ctx.lineTo(ORIGIN.x + length - penaltyHeight, ORIGIN.y - (penaltyLength / 2));
  ctx.lineTo(ORIGIN.x + length - penaltyHeight, ORIGIN.y + (penaltyLength / 2));
  ctx.lineTo(ORIGIN.x + length, ORIGIN.y + (penaltyLength / 2));

  ctx.moveTo(ORIGIN.x + length, ORIGIN.y + (7.32 * PIXELS_PER_METER / 2) + (5.5 * PIXELS_PER_METER));
  ctx.lineTo(ORIGIN.x + length - (5.5 * PIXELS_PER_METER), ORIGIN.y + (7.32 * PIXELS_PER_METER / 2) + (5.5 * PIXELS_PER_METER))
  ctx.lineTo(ORIGIN.x + length - (5.5 * PIXELS_PER_METER), ORIGIN.y - (7.32 * PIXELS_PER_METER / 2) - (5.5 * PIXELS_PER_METER));
  ctx.lineTo(ORIGIN.x + length, ORIGIN.y - (7.32 * PIXELS_PER_METER / 2) - (5.5 * PIXELS_PER_METER))

  ctx.stroke()

  const penaltyZone = 11 * PIXELS_PER_METER;

  ctx.beginPath();
  ctx.arc(ORIGIN.x + penaltyZone, ORIGIN.y, 9.15 * PIXELS_PER_METER, 306 * (Math.PI / 180), 54 * (Math.PI / 180));
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(ORIGIN.x + length - penaltyZone, ORIGIN.y, 9.15 * PIXELS_PER_METER, (306 - 180) * (Math.PI / 180), (54 + 180) * (Math.PI / 180))
  ctx.stroke()
}

const draw = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, relativePos: Vector2, path: CheckPoint[], width: number, height: number, axes: boolean,  angle: number, x: number, y: number) => {
  ctx.clearRect(0, 0, width, height);

  drawCourt(ctx)

  ctx.save()

  ctx.translate(ORIGIN.x + (x * PIXELS_PER_METER), ORIGIN.y + (y * PIXELS_PER_METER))
  ctx.fillRect(0,0, 4, 4)

  ctx.rotate(angle * Math.PI / 180);


  if (axes) drawCartesianAxes(ctx, width, height);

  ctx.fillStyle = 'rgba(255, 50, 50, 0.5)';
  const step = 10
  for (let i = 0; i < path.length; i += step) {
    const p = path[i] as CheckPoint;
    const screenX = p.pos.x * PIXELS_PER_METER;
    const screenY = p.pos.y * PIXELS_PER_METER;

    ctx.fillRect(screenX - 2, screenY - 2, 8, 8);
  }

  const screenX = relativePos.x * PIXELS_PER_METER;
  const screenY = relativePos.y * PIXELS_PER_METER;

  const size = 30;
  ctx.drawImage(img, screenX - (size / 2), screenY - (size / 2), size, size);

  const meterX = (relativePos.x).toFixed(2);
  const meterY = (-(relativePos.y)).toFixed(2); // Y positif ke bawah (Canvas standard)

  ctx.fillStyle = "#050000";
  ctx.textAlign = "left";
  ctx.fillText(`x: ${meterX}m`, screenX + 20, screenY);
  ctx.fillText(`y: ${meterY}m`, screenX + 20, screenY + 15);

  ctx.restore()
};

const main = () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');
  const controls = document.querySelectorAll(`input[name="control-type"]`) as NodeListOf<HTMLInputElement>;
  const control1 = document.getElementById('controls-1') as HTMLDivElement;
  const control2 = document.getElementById('controls-2') as HTMLDivElement;
  const times = document.getElementById('times') as HTMLInputElement;
  const timeDisplay = document.getElementById('timeDisplay') as HTMLInputElement;
  const gravity = document.getElementById('gravity') as HTMLInputElement;
  const theta = document.getElementById('theta') as HTMLInputElement;
  const thetaDisplay = document.getElementById('thetaDisplay') as HTMLInputElement;
  const initialVel = document.getElementById('v-x-awal') as HTMLInputElement;
  const initVX = document.getElementById('v-x') as HTMLInputElement;
  const initVY = document.getElementById('v-y') as HTMLInputElement;
  const acceleration = document.getElementById('a') as HTMLInputElement;
  const axes = document.getElementById('axes') as HTMLInputElement;
  const angle = document.getElementById('angle') as HTMLInputElement;
  const x = document.getElementById('x') as HTMLInputElement;
  const y = document.getElementById('y') as HTMLInputElement;

  if (!canvas || !ctx || !times || !gravity || !theta || !initialVel || !acceleration) return;

  const updateControl = (state: boolean) => {
    if (state) {
      control1.style.display = 'block';
      control2.style.display = 'none';
      return
    }

    control2.style.display = 'block';
    control1.style.display = 'none';
  }

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
      const vx = parseInt(initVX.value)
      const vy = parseInt(initVY.value)

      currentPath = generatePath(0, 0, 1000, g, t, v0, a, 14, 0.67, vx, vy);

      renderFrame()
    }

    const renderFrame = () => {
      const val = parseFloat(times.value)
      const timeInSeconds = val / 100;

      const isUseAxes = axes.checked

      const thetaInDeg = parseInt(theta.value)

      const angleInDeg = parseInt(angle.value)

      const posX = parseInt(x.value)
      const posY = parseInt(y.value)

      timeDisplay.innerText = timeInSeconds.toFixed(2) + "s";
      thetaDisplay.innerText = thetaInDeg + "°";

      const currentPos = getPositionAtTime(currentPath, timeInSeconds);

      draw(ctx, img, currentPos, currentPath, canvas.width, canvas.height, isUseAxes, angleInDeg, posX, posY);
    };

    renderWithNewPath()
    times.addEventListener('input', renderFrame);

    gravity.addEventListener('input', renderWithNewPath);
    theta.addEventListener('input', renderWithNewPath);
    initialVel.addEventListener('input', renderWithNewPath);
    acceleration.addEventListener('input', renderWithNewPath);
    axes.addEventListener('input', renderWithNewPath);
    initVX.addEventListener('input', renderWithNewPath);
    initVY.addEventListener('input', renderWithNewPath);
    angle.addEventListener('input', renderFrame);
    x.addEventListener('input', renderFrame);
    y.addEventListener('input', renderFrame);

    const updateControlAndRender = (state: boolean) => {
      Config.isControl1 = state
      updateControl(state)
      renderWithNewPath()
    }

    controls.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked) {
          if (input.value == "controls-1") updateControlAndRender(true)
          else updateControlAndRender(false)
        }
      })
    })

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
  ctx.moveTo(0 - ORIGIN.x, 0);
  ctx.lineTo(width, 0);

  // Garis Vertikal (Sumbu Y) - Sepanjang layar melewati ORIGIN.x ke atas
  ctx.moveTo(0, 0);
  ctx.lineTo(0, (height / 2) * -1);
  // Garis Vertikal (Sumbu Y) - Sepanjang layar melewati ORIGIN.x ke bawah
  ctx.moveTo(0, 0);
  ctx.lineTo(0, (height / 2));

  ctx.stroke();

  // --- B. LABEL & TICK MARK PADA SUMBU X ---
  // Loop ke KANAN dari origin (Nilai Positif)
  for (let x = ORIGIN.x; x < width; x += PIXELS_PER_METER) {
    const dist = x - ORIGIN.x; // Jarak pixel dari pusat
    const meter = dist / PIXELS_PER_METER;
    drawTickX(ctx, dist, meter);
  }
  // --- C. LABEL & TICK MARK PADA SUMBU Y ---
  // Loop ke BAWAH dari origin (Nilai Positif di Canvas)
  for (let y = ORIGIN.y; y < height; y += PIXELS_PER_METER) {
    const dist = y - ORIGIN.y;
    const meter = (dist / PIXELS_PER_METER);
    drawTickY(ctx, dist, meter, 1);
  }
  // Loop ke ATAS dari origin (Nilai Negatif)
  for (let y = ORIGIN.y; y > 0; y -= PIXELS_PER_METER) {
    const dist = ORIGIN.y - y;
    const meter = (dist / PIXELS_PER_METER) * -1;
    console.info(ORIGIN.y, y, dist, meter);
    drawTickY(ctx, dist, meter, -1);
  }

  // Label Titik Nol
  ctx.fillText("(0,0)", 0, 0);
};

// Helper kecil untuk gambar strip di sumbu X
const drawTickX = (ctx: CanvasRenderingContext2D, x: number, val: number) => {
  if (val === 0) return; // Jangan gambar di titik pusat lagi
  const isMajor = Math.abs(val) % 5 === 0;
  const height = isMajor ? 10 : 4;

  ctx.beginPath();
  ctx.moveTo(x, 0 - height / 2);
  ctx.lineTo(x, height / 2);
  ctx.stroke();

  if (isMajor) ctx.fillText(val.toString(), x, 15);
};

// Helper kecil untuk gambar strip di sumbu Y
const drawTickY = (ctx: CanvasRenderingContext2D, y: number, val: number, direction: number) => {
  if (val === 0) return;
  const isMajor = Math.abs(val) % 5 === 0;
  const width = isMajor ? 10 : 4;

  ctx.beginPath();
  ctx.moveTo(0 - width / 2, 0 - y * direction);
  ctx.lineTo(width / 2, 0 - y * direction);
  ctx.stroke();

  if (isMajor) ctx.fillText(val.toString(), -20, 0 - y * direction);
};