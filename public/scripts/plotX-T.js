(function () {
    const canvas = document.getElementById('x-t')
    if (!canvas || typeof Chart === 'undefined') return

    const chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'X Position',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Time (t)' }
                },
                y: {
                    title: { display: true, text: 'X Position' }
                }
            }
        }
    })

    window.setChartData = function (labels, data) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    }

    window.addPoint = function (label, value) {
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(value);
        chart.update();
    }
})()
