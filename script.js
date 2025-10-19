const heartContainer = document.querySelector('.heart-container');

function createHeart() {
  const heart = document.createElement('div');
  heart.classList.add('heart');
  heart.innerText = '💖';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
  heart.style.fontSize = (Math.random() * 10 + 10) + 'px';
  heart.style.animationDelay = (Math.random() * 3) + 's';
  heartContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 10000);
}
setInterval(createHeart, 300);

document.body.addEventListener('click', (event) => {
  for (let i = 0; i < 10; i++) {
    createHeartParticle(event.clientX, event.clientY);
  }
});

function createHeartParticle(x, y) {
  const heart = document.createElement('div');
  heart.classList.add('heart-particle');
  heart.innerText = '💞';
  heart.style.left = (x - 10) + 'px';
  heart.style.top = (y - 10) + 'px';
  let randomX = (Math.random() - 0.5) * 200;
  let randomY = (Math.random() - 0.5) * 200;
  heart.style.setProperty('--end-x', randomX + 'px');
  heart.style.setProperty('--end-y', randomY + 'px');
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1200);
}

// --- Hoa hồng + chữ SVG động ---
const SVG_NS = "http://www.w3.org/2000/svg";
const shape = document.getElementById("shape");
const partialPath = document.getElementById("partialPath");
const pathlength = shape.getTotalLength();
let t = 0, rid = null;
let d = shape.getAttribute("d");
let n = d.match(/C/gi).length;
let pos = 0;

class subPath {
  constructor(d) {
    this.d = d;
    this.get_PointsRy();
    this.previous = subpaths.length > 0 ? subpaths[subpaths.length - 1] : null;
    this.measurePath();
    this.get_M_Point();
    this.get_lastCubicBezier();
  }
  get_PointsRy() {
    this.pointsRy = this.d.split(/[A-Z,a-z\s,]/).filter(v => v).map(parseFloat);
  }
  measurePath() {
    let path = document.createElementNS(SVG_NS, "path");
    path.setAttributeNS(null, "d", this.d);
    this.pathLength = path.getTotalLength();
  }
  get_M_Point() {
    let p = this.previous ? this.previous.pointsRy : this.pointsRy;
    let l = p.length;
    this.M_point = this.previous ? [p[l - 2], p[l - 1]] : [p[0], p[1]];
  }
  get_lastCubicBezier() {
    let lastIndexOfC = this.d.lastIndexOf("C");
    let temp = this.d.substring(lastIndexOfC + 1).split(/[\s,]/).filter(v => v).map(parseFloat);
    this.lastCubicBezier = [this.M_point];
    for (let i = 0; i < temp.length; i += 2) this.lastCubicBezier.push(temp.slice(i, i + 2));
  }
}

let subpaths = [];
for (let i = 0; i < n; i++) {
  let newpos = d.indexOf("C", pos + 1);
  if (i > 0) subpaths.push(new subPath(d.substring(0, newpos)));
  pos = newpos;
}
subpaths.push(new subPath(d));

function get_T(t, index) {
  let lengthAtT = pathlength * t;
  if (index > 0)
    return (lengthAtT - subpaths[index].previous.pathLength) /
      (subpaths[index].pathLength - subpaths[index].previous.pathLength);
  return lengthAtT / subpaths[index].pathLength;
}

function lerp(A, B, t) {
  return [(B[0] - A[0]) * t + A[0], (B[1] - A[1]) * t + A[1]];
}

function getBezierPoints(t, points) {
  let h = [];
  for (let i = 1; i < 4; i++) h.push(lerp(points[i - 1], points[i], t));
  h.push(lerp(h[0], h[1], t));
  h.push(lerp(h[1], h[2], t));
  h.push(lerp(h[3], h[4], t));
  return [points[0], h[0], h[3], h[5]];
}

function drawCBezier(points, path, index) {
  let d = index > 0 ? subpaths[index].previous.d : `M${points[0][0]},${points[0][1]} C`;
  for (let i = 1; i < 4; i++) d += ` ${points[i][0]},${points[i][1]} `;
  path.setAttributeNS(null, "d", d);
}

function Typing() {
  rid = requestAnimationFrame(Typing);
  if (t >= 1) cancelAnimationFrame(rid);
  else t += 0.005;
  let lengthAtT = pathlength * t;
  let index = subpaths.findIndex(sp => sp.pathLength >= lengthAtT);
  let T = get_T(t, index);
  let newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier);
  drawCBezier(newPoints, partialPath, index);
}
requestAnimationFrame(Typing);
