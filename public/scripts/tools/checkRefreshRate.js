function checkRefreshRate(){
    return new Promise((resolve) => {
        let frames = 0;
        startTime = null;
    })

    function checkFrame(currentTime) {
        if (startTime === null) startTime = currentTime;
        frames++;
        const elapsedTime = currentTime - startTime;

        if (elapsedTime >= 1000){
            resolve(Math.round(((frames - 1) * 1000) / elapsedTime));
            return;
        }
        requestAnimationFrame(checkFrame);
    }
    requestAnimationFrame(checkFrame);
 }