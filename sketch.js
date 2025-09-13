let cam, camW = 320, camH = 240;
let pixelSize = 12;         // piksel boyutu
let thresholdVal = 35;      // eşik değeri
let useColor = true;        // renkli mi siyah mı
let bgImg;                  // arkaplan
let hasBG = false;          // arkaplan alındı mı

function setup() {
  createCanvas(camW * 3, camH * 3); // büyük tuval
  pixelDensity(1);
  cam = createCapture(VIDEO); // kamerayı aç
  cam.size(camW, camH);
  cam.hide();

  bgImg = createImage(camW, camH); // boş arkaplan
  background(255); // arkaplan beyaz
  textStyle(BOLD); textAlign(CENTER, CENTER);
}

function draw() {
  background(255); // her karede beyaz

  cam.loadPixels();
  if (cam.pixels.length === 0) return; // kamera hazır değilse dur

  if (hasBG) bgImg.loadPixels(); // arkaplan varsa yükle

  const scaleFactor = width / camW; // büyütme
  const step = pixelSize; // piksel adımı

  push();
  translate(width, 0); // ayna
  scale(-1, 1);

  noStroke();
  for (let y = 0; y < camH; y += step) {
    for (let x = 0; x < camW; x += step) {
      const idx = 4 * (y * camW + x);

      const r = cam.pixels[idx + 0];
      const g = cam.pixels[idx + 1];
      const b = cam.pixels[idx + 2];

      let diff;
      if (hasBG) {
        const r0 = bgImg.pixels[idx + 0];
        const g0 = bgImg.pixels[idx + 1];
        const b0 = bgImg.pixels[idx + 2];
        diff = (abs(r - r0) + abs(g - g0) + abs(b - b0)) / 3;
      } else {
        const bright = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        diff = 255 - bright;
      }

      if (diff > thresholdVal) {
        if (useColor) {
          fill(r, g, b); // renkli
        } else {
          fill(0); // siyah
        }
        rect(x * scaleFactor, y * scaleFactor, step * scaleFactor, step * scaleFactor);
      }
    }
  }
  pop();

  drawHUD(); // yazılar
}

function keyPressed() {
  if (key === 'B' || key === 'b') {
    bgImg.copy(cam, 0, 0, camW, camH, 0, 0, camW, camH); // arkaplan al
    hasBG = true;
    flashNote("Arkaplan kaydedildi ✓");
  }
  if (keyCode === LEFT_ARROW)  { pixelSize = max(4, pixelSize - 1); }   // piksel küçült
  if (keyCode === RIGHT_ARROW) { pixelSize = min(40, pixelSize + 1); }  // piksel büyüt
  if (keyCode === UP_ARROW)    { thresholdVal = min(255, thresholdVal + 2); }  // eşik artır
  if (keyCode === DOWN_ARROW)  { thresholdVal = max(0, thresholdVal - 2); }    // eşik düşür
  if (key === 'C' || key === 'c') { useColor = !useColor; }  // renk ↔ siyah
  if (key === 'S' || key === 's') { saveCanvas('pixel_siluet', 'png'); } // kaydet
}

let flashTimer = 0, flashText = "";
function flashNote(t) { flashText = t; flashTimer = 60; }
function drawHUD() {
  push();
  noStroke();
  fill(0, 180);
  textSize(12);
  const lines = [
    "B: Arkaplan yakala  |  C: Renkli/Siyah  |  S: Kaydet",
    "←/→ Piksel boyutu: " + pixelSize + "   ↑/↓ Eşik: " + thresholdVal,
    hasBG ? "Arkaplan: Etkin" : "Arkaplan: Yok"
  ];
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width/2, 18 + i*16);
  }
  if (flashTimer > 0) {
    fill(0, 220);
    text(flashText, width/2, height - 24);
    flashTimer--;
  }
  pop();
}
