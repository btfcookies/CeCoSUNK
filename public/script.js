const canvas = document.querySelector('#space');
const ctx = canvas.getContext("2d");
const logDisplay = document.querySelector('#log');
const posDisplay = document.querySelector('#pos');
const bodySettings = document.querySelector('#body-settings');
const timeDisplay = document.querySelector('#time-display');
const massInput = document.querySelector('#mass-input');
const xPosInput = document.querySelector('#xpos-input');
const yPosInput = document.querySelector('#ypos-input');
const radiusInput = document.querySelector('#radius-input');
const colorInput = document.querySelector('#color-input');


const G = 1; // gravitational constant
let t = 0; // start time of the simulated universe
const dt = 1; ; // step for velociy verlet

let zoom = 1;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 200;
const ZOOM_STEP = 1.2;

let refreshRate = 60; // fallback before measured
checkRefreshRate().then(hz => {refreshRate = hz;});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.001;
    zoom *= 1 - e.deltaY * zoomIntensity;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}, { passive: false });

function zoomIn(){
    zoom *= ZOOM_STEP;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

function zoomOut(){
    zoom /= ZOOM_STEP;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

const bodies = [
    { x: 300, y: 300, vx: 0,    vy: 0,    mass: 5000, radius: 20, color: "yellow" },      // star
    { x: 450, y: 300, vx: 0,    vy: 2.4,  mass: 5,     radius: 6,  color: "blue" },  // planet 1
    { x: 200, y: 300, vx: 0,    vy: -3.2, mass: 3,     radius: 4,  color: "red" },   // planet 2
    { x: 300, y: 480, vx: -2.6, vy: 0,    mass: 4,     radius: 5,  color: "green" },   // planet 3
]

const velocityDisplays = [];
const posDisplays = [];

function addDisplaysFor(index) {
    const velocityDiv = document.createElement('div');
    velocityDiv.classList.add('velocityDisplay' + index);
    logDisplay.append(velocityDiv);
    velocityDisplays.push(velocityDiv);

    const posDiv = document.createElement('div');
    posDiv.classList.add('posDisplay' + index);
    posDisplay.append(posDiv);
    posDisplays.push(posDiv);
}

bodies.forEach((_, i) => addDisplaysFor(i));

function updateTime(){
    t++;
    const seconds = t / refreshRate;
    timeDisplay.innerHTML = "t = " + seconds.toFixed(2) + " s";
}

function drawCircle(x, y, radius, color){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI *2);
    ctx.fillStyle = color;
    ctx.fill();
}

function orbitSpeed(star, planet) {
    const r = Math.hypot(planet.x - star.x, planet.y - star.y);
    return Math.sqrt((G * star.mass) / r);
}

function initializeOrbits(star, planet) {
    const dx = planet.x - star.x;
    const dy = planet.y - star.y;
    const r = Math.hypot(dx, dy);
    const v = Math.sqrt((G * star.mass) / r);
    planet.vx = (-dy / r) * v; 
    planet.vy = (dx / r) * v;
}

for (const b of bodies.slice(1)) initializeOrbits(bodies[0], b);

function displayStats() {
    for (let i=0; i<bodies.length; i++){
        velocityDisplays[i].textContent = "Body " + i + "\n" + "vx: " + bodies[i].vx + "\n vy: " + bodies[i].vy + "\n";
    }
    for (let i = 0; i<bodies.length; i++){
        posDisplays[i].textContent = "Body " + i + "\n" + "pos x: " + bodies[i].x + "\n pos y : " + bodies[i].y + "\n";
    }
}

function openVT(){
    window.open('v-t.html', 'vtGraph', 'width=900,height=600');
}

function openXT(){
    window.open('x-t.html', 'xtGraph', 'width=900,height=600');
}

function updateVT(){
    for (let i=0; i<bodies.length; i++){
        addPoint(t, bodies[i].vx, i, bodies[i].color);
    }
}

function updateXT(){
    for (let i=0; i<bodies.length; i++){
        addXPoint(t, bodies[i].x, i, bodies[i].color);
    }
}

function displaySettings(){
    bodySettings.style.display = 'flex';
}

function createBody(){
    let inputtedMass = parseFloat(massInput.value);
    let xpos = parseFloat(xPosInput.value);
    let ypos = parseFloat(yPosInput.value);
    let inputtedRadius = parseFloat(radiusInput.value);
    let inputtedColor = colorInput.value;

    if ([inputtedMass, xpos, ypos, inputtedRadius].some(Number.isNaN)) {
        alert("Mass, X pos, Y pos, and Radius must all be numbers.");
        return;
    }

    let newBody = {x: xpos, y: ypos, vx: 0, vy: 0, mass: inputtedMass, radius: inputtedRadius, color: inputtedColor};
    bodies.push(newBody);
    addDisplaysFor(bodies.length - 1);
}

function computeAcceleration(){
    const acc = bodies.map(() => ({ax: 0, ay: 0}));
    for (let i = 0; i<bodies.length; i++) {
        for (let j = 0; j<bodies.length; j++){
            if (i === j) continue;
            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;
            const dist = Math.hypot(dx, dy) || 1; // replace || 1 with calculation later
            const a = G * bodies[j].mass / (dist ** 2);
            acc[i].ax += a * dx/dist;
            acc[i].ay += a * dy/dist;

        }
    }
    return acc;
}

function update() {
    let acc = computeAcceleration();
    bodies.forEach((b, i) => {
        b.vx += 0.5 * acc[i].ax * dt;
        b.vy += 0.5 * acc[i].ay * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
    });
    acc = computeAcceleration();
    bodies.forEach((b, i) => {
        b.vx += 0.5 * acc[i].ax * dt;
        b.vy += 0.5 * acc[i].ay * dt;
    });

}

function render() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; //trail
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    for (const b of bodies) drawCircle(b.x, b.y, b.radius, b.color);
    ctx.restore();
}

function loop(){
    update();
    render();
    displayStats();
    updateTime();
    requestAnimationFrame(loop);
}

loop();
setInterval(updateVT, 500);
setInterval(updateXT, 500);
