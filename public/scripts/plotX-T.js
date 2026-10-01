(function () {
    const canvas = document.querySelector('canvas')

    new Chart(canvas, {
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
        chat.data.datasets[0].data = data;
        chart.update();
    }

    window.addPoint = function (label, value) {
        chart.labels.push(label);
        chart.data.datasets[0].data.push(value);
        chart.update();
    }
})()



