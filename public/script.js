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
const bhSettings = document.querySelector('#black-hole-settings');
const bhMassInput = document.querySelector('#bh-mass-input');
const bhXPosInput = document.querySelector('#bh-xpos-input');
const bhYPosInput = document.querySelector('#bh-ypos-input');
const bhHorizonReadout = document.querySelector('#bh-horizon-readout');

const G = 6.674e-11; // gravitational constant (m^3/kg*s^2)
const C = 299792458; // speed of light (m/s)
const AU = 1.495978707e11; // m
const M_SUN = 1.989e30; // mass of the sun (kg)
const DAY = 86400; // s
const YEAR = 365.25 * DAY; // s
const EPS = 1e7; // softening length for plummer softening (m)


let t = 0; // elapsed simulated time (s)
let metersPerPixel = 1e9; // 1 AU = ~150 px
let dt = 600; // simulated seconds per physics step used in velocity verlet
let stepsPerFrame = 100; // time warp
let nextBodyId = 0;

const bodies = [
    { id: nextBodyId++, x: 0, y: 0, vx: 0, vy: 0, mass: M_SUN, isBlackHole: false, drawRadius: 10, color: "yellow" }, // Sun
    { id: nextBodyId++, x: AU, y: 0, vx: 0, vy: 0, mass: 5.972e24, isBlackHole: false, drawRadius: 4, color: "blue" },  // Earth

]

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



const velocityDisplays = new Map(); // body id -> div
const posDisplays = new Map();

function addDisplaysFor(id) {
    const velocityDiv = document.createElement('div');
    velocityDiv.classList.add('velocityDisplay' + id);
    logDisplay.append(velocityDiv);
    velocityDisplays.set(id, velocityDiv);

    const posDiv = document.createElement('div');
    posDiv.classList.add('posDisplay' + id);
    posDisplay.append(posDiv);
    posDisplays.set(id, posDiv);
}

function removeDisplaysFor(id) {
    velocityDisplays.get(id)?.remove();
    velocityDisplays.delete(id);
    posDisplays.get(id)?.remove();
    posDisplays.delete(id);
}

bodies.forEach(b => addDisplaysFor(b.id));

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
    for (const b of bodies) {
        const label = (b.isBlackHole ? "Black hole " : "Body ") + b.id + "\n";
        velocityDisplays.get(b.id).textContent = label + "vx: " + b.vx + "\n vy: " + b.vy + "\n";
        posDisplays.get(b.id).textContent = label + "pos x: " + b.x + "\n pos y : " + b.y + "\n";
    }
}

function openVT(){
    window.open('v-t.html', 'vtGraph', 'width=900,height=600');
}

function openXT(){
    window.open('x-t.html', 'xtGraph', 'width=900,height=600');
}

function updateVT(){
    for (const b of bodies) {
        addPoint(t / DAY, b.vx, b.id, b.color);
    }
}

function updateXT(){
    for (const b of bodies) {
        addXPoint(t / DAY, b.x, b.id, b.color);
    }
}

// Only one creation form is open at a time so they don't fight for the side panel's space
function displaySettings(){
    bhSettings.style.display = 'none';
    bodySettings.style.display = 'flex';
}

function displayBlackHoleSettings(){
    bodySettings.style.display = 'none';
    bhSettings.style.display = 'flex';
    updateHorizonReadout();
}

function formatLength(m){
    if (m >= AU / 10) return (m / AU).toPrecision(3) + " AU";
    if (m >= 1e6) return (m / 1e3).toPrecision(3) + " km";
    return m.toPrecision(3) + " m";
}

function updateHorizonReadout(){
    const solarMasses = parseFloat(bhMassInput.value);
    bhHorizonReadout.textContent = solarMasses > 0
        ? formatLength(computeSchwartzchildRadius(solarMasses * M_SUN))
        : "-";
}

bhMassInput.addEventListener('input', updateHorizonReadout);

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
    if (inputtedMass <= 0 || inputtedRadius <= 0) {
        alert("Mass and Radius must be greater than zero.");
        return;
    }

    let newBody = {id: nextBodyId++, x: xpos * AU, y: ypos * AU, vx: 0, vy: 0, mass: inputtedMass * M_SUN, isBlackHole: false, drawRadius: inputtedRadius, color: inputtedColor};
    bodies.push(newBody);
    addDisplaysFor(newBody.id);
}

// Position fields may be left blank, which means the origin
function parseOptionalNumber(input){
    return input.value.trim() === "" ? 0 : parseFloat(input.value);
}

function createBlackHole(){
    const solarMasses = parseFloat(bhMassInput.value);
    const xpos = parseOptionalNumber(bhXPosInput);
    const ypos = parseOptionalNumber(bhYPosInput);

    if ([solarMasses, xpos, ypos].some(Number.isNaN)) {
        alert("Mass, X pos, and Y pos must all be numbers.");
        return;
    }
    if (solarMasses <= 0) {
        alert("Mass must be greater than zero.");
        return;
    }

    const mass = solarMasses * M_SUN;
    const blackHole = {
        id: nextBodyId++,
        x: xpos * AU,
        y: ypos * AU,
        vx: 0,
        vy: 0,
        mass,
        isBlackHole: true,
        horizonRadius: computeSchwartzchildRadius(mass),
        drawRadius: 0,
        color: "black",
    };
    bodies.push(blackHole);
    addDisplaysFor(blackHole.id);
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

function computeSchwartzchildRadius(mass){
    let sR = 2*G*mass / C**2;
    return sR;
}

function closestApproach(bh, b) {
    const x0 = b.prevX - bh.prevX, y0 = b.prevY - bh.prevY;
    const dx = (b.x - bh.x) - x0, dy = (b.y - bh.y) - y0;
    const len2 = dx * dx + dy * dy;
    const s = len2 === 0 ? 0 : Math.min(1, Math.max(0, -(x0 * dx + y0 * dy) / len2));
    return Math.hypot(x0 + s * dx, y0 + s * dy);
}

// A body that crosses a horizon is merged into the hole (momentum and centre of mass conserved).
function absorbCaptured() {
    for (const bh of bodies.filter(b => b.isBlackHole)) {
        if (!bodies.includes(bh)) continue; // already swallowed by a bigger hole this step
        for (let i = bodies.length - 1; i >= 0; i--) {
            const b = bodies[i];
            if (b === bh) continue;
            if (b.isBlackHole && b.mass > bh.mass) continue; // the heavier hole absorbs, not the other way round
            if (closestApproach(bh, b) < bh.horizonRadius) {
                const M = bh.mass + b.mass;
                const newX = (bh.x * bh.mass + b.x * b.mass) / M;
                const newY = (bh.y * bh.mass + b.y * b.mass) / M;
                bh.prevX += newX - bh.x; // keep the sweep frame consistent for the rest of this step
                bh.prevY += newY - bh.y;
                bh.x = newX;
                bh.y = newY;
                bh.vx = (bh.vx * bh.mass + b.vx * b.mass) / M;
                bh.vy = (bh.vy * bh.mass + b.vy * b.mass) / M;
                bh.mass = M;
                bh.horizonRadius = computeSchwartzchildRadius(M); // it grows
                bodies.splice(i, 1);
                removeDisplaysFor(b.id);
            }
        }
    }
}

function update() {
    for (const b of bodies) {
        b.prevX = b.x;
        b.prevY = b.y;
    }
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
    absorbCaptured();
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
        if (b.isBlackHole){
            const r = Math.max(b.horizonRadius / metersPerPixel, 2); //always larger than 2px
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 1.6, 0, Math.PI * 2);
            ctx.strokeStyle = "orange";
            ctx.lineWidth = 2;
            ctx.stroke();
            drawCircle(p.x, p.y, r, "black");
        } else {
            drawCircle(p.x, p.y, b.drawRadius, b.color);
        }
    }
    ctx.restore();
}

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
