const canvas = document.querySelector('#space');
const ctx = canvas.getContext("2d");

const G = 1; //gravitational constant
const sun = {x: 300, y: 300, mass: 20000};
const planet = {
    x: 450, y: 300, //start pos
    vx: 0, vy: 11.5, 
    mass: 5
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

    planet.vx += ax;
    planet.vy += ay;
    planet.x += planet.vx;
    planet.y += planet.vy;
}

function render() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);
    drawCircle(sun.x, sun.y, 20, "yellow");
    drawCircle(planet.x, planet.y, 8, "blue");
}

function loop(){
    update();
    render();
    requestAnimationFrame(loop);
}

loop();

drawCircle(300,300,20,"yellow"); //star
drawCircle(450,300,8,"blue"); //planet