function checkRefreshRate(){
    let frames = 0;
    let startTime = performance.now();

    function checkFrame(currentTime) {
        frames++;
        const elapsedTime = currentTime - startTime;

        if (elapsedTime >= 1000){
            const estimatedHz = Math.round((frameCount * 1000) / elapsedTime);
            
        }
        requestAnimationFrame(checkFrame);
    }
    requestAnimationFrame(checkFrame);
 }