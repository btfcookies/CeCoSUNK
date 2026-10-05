(function () {
    const MAX_POINTS = 500

    // Velocity history lives on the simulation page so a popup chart can read it.
    const store = []
    window.vtStore = store

    window.addPoint = function (time, value, bodyIndex, color) {
        if (!store[bodyIndex]) store[bodyIndex] = { color: color, data: [] }
        const data = store[bodyIndex].data
        data.push({ x: time, y: value })
        if (data.length > MAX_POINTS) data.shift()
    }

    const canvas = document.getElementById('velocity')
    if (!canvas || typeof Chart === 'undefined') return

    const chart = new Chart(canvas, {
        type: 'line',
        data: { datasets: [] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            parsing: false,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: 'Time (days)' }
                },
                y: {
                    title: { display: true, text: 'Velocity vx (m/s)' }
                }
            }
        }
    })

    // Chart window: mirror the opener's history.
    function sync() {
        let source
        try {
            source = window.opener && window.opener.vtStore
        } catch (e) {
            return
        }
        if (!source) return
        source.forEach(function (body, i) {
            if (!body) return
            let dataset = chart.data.datasets[i]
            if (!dataset) {
                while (chart.data.datasets.length <= i) {
                    chart.data.datasets.push({
                        label: 'Body ' + chart.data.datasets.length,
                        data: [],
                        pointRadius: 0,
                        tension: 0.1
                    })
                }
                dataset = chart.data.datasets[i]
            }
            dataset.borderColor = body.color
            dataset.data = body.data.slice()
        })
        chart.update('none')
    }

    sync()
    setInterval(sync, 500)
})()
