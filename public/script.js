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

const G = 6.674e-11; // gravitational constant (m^3/kg*s^2)
const C = 299792458; // speed of light (m/s)
const AU = 1.495978707e11; // m
const M_SUN = 1.989e30; // mass of the sun (kg)
const DAY = 86400; // s
const YEAR = 365.25 * DAY; // s
const EPS = 1e7; // softening length for plummer softening (m)

let t = 0; // elapsed simulated time (s)
let metersPerPixel = 1e9; // 1 AU = ~150 px
let dt = DAY; // simulated seconds per physics step used in velocity verlet
let stepsPerFrame = 1; // time warp

let zoom = 1;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 200;
const ZOOM_STEP = 1.2;

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
    { x: 0, y: 0, vx: 0, vy: 0, mass: M_SUN, drawRadius: 10, color: "yellow" }, // Sun
    { x: AU, y: 0, vx: 0, vy: 0, mass: 5.972e24, drawRadius: 4, color: "blue" },  // Earth

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
    const days = t / DAY;
    const years = t / YEAR;
    timeDisplay.textContent = "t = " + days.toFixed(1) + " days (" + years.toFixed(2) + " yr)";
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
        addPoint(t / DAY, bodies[i].vx, i, bodies[i].color);
    }
}

function updateXT(){
    for (let i=0; i<bodies.length; i++){
        addXPoint(t / DAY, bodies[i].x, i, bodies[i].color);
    }
}

function displaySettings(){
    bodySettings.style.display = 'flex';
}

function createBody(){
    // inputs are in friendly units: mass in solar masses, position in AU, radius in pixels
    let inputtedMass = parseFloat(massInput.value);
    let xpos = parseFloat(xPosInput.value);
    let ypos = parseFloat(yPosInput.value);
    let inputtedRadius = parseFloat(radiusInput.value);
    let inputtedColor = colorInput.value;

    if ([inputtedMass, xpos, ypos, inputtedRadius].some(Number.isNaN)) {
        alert("Mass, X pos, Y pos, and Radius must all be numbers.");
        return;
    }
    if (inputtedMass <= 0 || inputtedRadius <= 0) {
        alert("Mass and Radius must be greater than zero.");
        return;
    }

    // convert to SI for the physics
    let newBody = {x: xpos * AU, y: ypos * AU, vx: 0, vy: 0, mass: inputtedMass * M_SUN, drawRadius: inputtedRadius, color: inputtedColor};
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
            const distSq = dx ** 2 + dy ** 2 + EPS ** 2;
            const invDist3 = 1 / (distSq * Math.sqrt(distSq));
            const a = G * bodies[j].mass * invDist3;
            acc[i].ax += a * dx;
            acc[i].ay += a * dy;

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
    for (const b of bodies) {
        const p = worldToScreen(b);
        drawCircle(p.x, p.y, b.drawRadius, b.color);
    }
    ctx.restore();
}

// physics lives in meters; the canvas is only a view of it, centered on the origin
function worldToScreen(b) {
    return {
        x: canvas.width / 2 + b.x / metersPerPixel,
        y: canvas.height / 2 + b.y / metersPerPixel,
    };
}

function loop(){
    for (let s = 0; s < stepsPerFrame; s++) {
        update();
        t += dt;
    }
    render();
    displayStats();
    updateTime();
    requestAnimationFrame(loop);
}

loop();
setInterval(updateVT, 500);
setInterval(updateXT, 500);
