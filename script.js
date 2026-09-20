const canvas = document.querySelector('#space');
const ctx = canvas.getContext("2d");


function drawCircle(x, y, radius, color){
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI *2);
    ctx.fillStyle = color;
    ctx.fill();
}

drawCircle(300,300,20,"yellow"); //star
drawCircle(450,300,8,"blue"); //planet