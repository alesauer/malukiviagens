import fs from 'fs';

// Criação de um favicon.ico no padrão Windows ICO (32x32 pixels, 32bpp RGBA)
const width = 32;
const height = 32;

// Buffer de pixels: 32x32x4 em formato BGRA (de baixo para cima, padrão BMP)
const pixelData = Buffer.alloc(width * height * 4);

// Cor de fundo: Teal profundo #0f766e (B: 110, G: 118, R: 15)
// Cor do avião: Branco #ffffff (B: 255, G: 255, R: 255)
// Cor do rastro/sol: Laranja #f97316 (B: 22, G: 115, R: 249)

function setPixel(x, y, r, g, b, a = 255) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  // No BMP, y=0 é a linha inferior
  const bmpY = height - 1 - y;
  const idx = (bmpY * width + x) * 4;
  pixelData[idx] = b;
  pixelData[idx + 1] = g;
  pixelData[idx + 2] = r;
  pixelData[idx + 3] = a;
}

// 1. Desenhar fundo arredondado (squircle) com gradiente suave
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    // Distância para os cantos para arredondar (raio ~8px)
    const cornerRadius = 8;
    let inside = true;
    let dist = 0;

    if (x < cornerRadius && y < cornerRadius) {
      dist = Math.hypot(cornerRadius - x, cornerRadius - y);
      if (dist > cornerRadius) inside = false;
    } else if (x >= width - cornerRadius && y < cornerRadius) {
      dist = Math.hypot(x - (width - 1 - cornerRadius), cornerRadius - y);
      if (dist > cornerRadius) inside = false;
    } else if (x < cornerRadius && y >= height - cornerRadius) {
      dist = Math.hypot(cornerRadius - x, y - (height - 1 - cornerRadius));
      if (dist > cornerRadius) inside = false;
    } else if (x >= width - cornerRadius && y >= height - cornerRadius) {
      dist = Math.hypot(x - (width - 1 - cornerRadius), y - (height - 1 - cornerRadius));
      if (dist > cornerRadius) inside = false;
    }

    if (inside) {
      // Gradiente suave de cima para baixo
      const t = y / height;
      const r = Math.round(15 * (1 - t) + 19 * t);
      const g = Math.round(118 * (1 - t) + 78 * t);
      const b = Math.round(110 * (1 - t) + 74 * t);
      setPixel(x, y, r, g, b, 255);
    } else if (dist <= cornerRadius + 1.2) {
      // Anti-aliasing suave na borda
      const alpha = Math.max(0, Math.min(255, Math.round((cornerRadius + 1.2 - dist) * 200)));
      setPixel(x, y, 15, 118, 110, alpha);
    } else {
      setPixel(x, y, 0, 0, 0, 0); // Transparente
    }
  }
}

// 2. Desenhar arco / globo sutil
for (let deg = 0; deg < 360; deg += 3) {
  const rad = (deg * Math.PI) / 180;
  const cx = 16 + 12 * Math.cos(rad);
  const cy = 16 + 12 * Math.sin(rad);
  const px = Math.round(cx);
  const py = Math.round(cy);
  if (px >= 0 && px < width && py >= 0 && py < height) {
    // Linha sutil verde-água translúcida
    setPixel(px, py, 94, 234, 212, 50);
  }
}

// 3. Trilha de voo curva (laranja/amarelo)
for (let t = 0; t <= 1; t += 0.05) {
  // Curva de Bézier de (6, 25) até (18, 12)
  const x = Math.round((1 - t) * (1 - t) * 6 + 2 * (1 - t) * t * 10 + t * t * 18);
  const y = Math.round((1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 18 + t * t * 12);
  setPixel(x, y, 249, 115, 22, 220);
  setPixel(x + 1, y, 251, 146, 60, 180);
}

// Ponto de partida
setPixel(6, 25, 249, 115, 22, 255);
setPixel(7, 25, 249, 115, 22, 255);
setPixel(6, 26, 249, 115, 22, 255);
setPixel(7, 26, 249, 115, 22, 255);

// 4. Desenhar o Avião estilizado em direção ao topo direito (diagonal)
// Coordenadas aproximadas do corpo e asas do avião na diagonal
const planePoints = [
  // Bico / Nariz
  [25, 7], [24, 8],
  // Fuselagem
  [23, 9], [22, 10], [21, 11], [20, 12], [19, 13], [18, 14], [17, 15], [16, 16],
  [24, 9], [23, 10], [22, 11], [21, 12], [20, 13], [19, 14], [18, 15],
  // Asa Superior Esquerda
  [20, 8], [19, 7], [18, 6], [17, 6], [16, 7], [17, 8], [18, 9], [19, 10], [20, 11],
  [18, 7], [17, 7],
  // Asa Inferior Direita
  [22, 13], [23, 14], [23, 15], [24, 16], [24, 17], [23, 17], [22, 16], [21, 15], [21, 14],
  [23, 16],
  // Cauda / Leme
  [15, 17], [14, 18], [13, 18], [13, 17], [14, 16], [15, 16]
];

for (const [px, py] of planePoints) {
  setPixel(px, py, 255, 255, 255, 255);
}

// Estrutura do arquivo .ICO
const iconDir = Buffer.alloc(6);
iconDir.writeUInt16LE(0, 0); // Reservado
iconDir.writeUInt16LE(1, 2); // Tipo: 1 = ICO
iconDir.writeUInt16LE(1, 4); // Número de imagens: 1

const iconEntry = Buffer.alloc(16);
iconEntry.writeUInt8(width, 0);       // Largura
iconEntry.writeUInt8(height, 1);      // Altura
iconEntry.writeUInt8(0, 2);           // Paleta de cores
iconEntry.writeUInt8(0, 3);           // Reservado
iconEntry.writeUInt16LE(1, 4);        // Planos de cor
iconEntry.writeUInt16LE(32, 6);       // Bits por pixel (32-bit RGBA)

const biSizeImage = width * height * 4;
const maskSize = ((width + 31) >> 5) * 4 * height; // 32 * 4 = 128 bytes
const imageSize = 40 + biSizeImage + maskSize;

iconEntry.writeUInt32LE(imageSize, 8); // Tamanho dos dados
iconEntry.writeUInt32LE(6 + 16, 12);   // Offset dos dados no arquivo (22)

// BITMAPINFOHEADER (40 bytes)
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);            // biSize
bmpHeader.writeInt32LE(width, 4);          // biWidth
bmpHeader.writeInt32LE(height * 2, 8);     // biHeight (x2 no ICO para máscara)
bmpHeader.writeUInt16LE(1, 12);            // biPlanes
bmpHeader.writeUInt16LE(32, 14);           // biBitCount
bmpHeader.writeUInt32LE(0, 16);            // biCompression (BI_RGB)
bmpHeader.writeUInt32LE(biSizeImage, 20);  // biSizeImage
bmpHeader.writeInt32LE(0, 24);             // biXPelsPerMeter
bmpHeader.writeInt32LE(0, 28);             // biYPelsPerMeter
bmpHeader.writeUInt32LE(0, 32);            // biClrUsed
bmpHeader.writeUInt32LE(0, 36);            // biClrImportant

const andMask = Buffer.alloc(maskSize, 0); // Máscara 1-bit toda zerada

const icoBuffer = Buffer.concat([iconDir, iconEntry, bmpHeader, pixelData, andMask]);
fs.writeFileSync('public/favicon.ico', icoBuffer);
console.log('public/favicon.ico gerado com sucesso! Tamanho:', icoBuffer.length, 'bytes');
