const canvas = document.querySelector('#space');
const ctx = canvas.getContext("2d");
const SCALE = 150; //pixels per AU
const dt = 1 / 365; //years per frame (1 day)
const cx = canvas.width / 2, cy = canvas.height / 2;

const G = 4 * Math.PI ** 2; //gravitational constant
const sun = {x: 0, y: 0, mass: 1};
const planet = {
    x: 1, y: 0, //start pos
    vx: 0, vy: 2 * Math.PI, 
    mass: 3.003e-6
}

function drawCircle(x, y, radius, color){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI *2);
    ctx.fillStyle = color;
    ctx.fill();
}

function update() {
    const dx = sun.x - planet.x;
    const dy = sun.y - planet.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const force = (G * sun.mass * planet.mass) / (distance*distance); //Newton's Law of Universal Gravitation

    // force to acceleration
    const ax = (force * dx) / distance /planet.mass;
    const ay = (force * dy) / distance /planet.mass;

    planet.vx += ax * dt;
    planet.vy += ay * dt;
    planet.x += planet.vx * dt;
    planet.y += planet.vy * dt;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCircle(cx + sun.x * SCALE, cy + sun.y * SCALE, 20, "yellow");
    drawCircle(cx + planet.x * SCALE, cy + planet.y * SCALE, 8, "blue");
}

function loop(){
    update();
    render();
    requestAnimationFrame(loop);
}

loop();