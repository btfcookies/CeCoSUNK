function checkRefreshRate(){
    let frames = 0;
    let startTime = performance.now();

    function checkFrame(currentTime) {
        frames++;
        const elapsedTime = currentTime - startTime;

        if (elapsedTime >= 1000){
            const estimatedHz = Math.round((frames * 1000) / elapsedTime);
            return estimatedHz;
        }
        requestAnimationFrame(checkFrame);
    }
    requestAnimationFrame(checkFrame);
 }