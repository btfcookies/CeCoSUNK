(function () {
    var root = document.documentElement;
    var saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) {}
    if (saved === 'dark') root.setAttribute('data-theme', 'dark');

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.createElement('button');
        btn.className = 'theme-toggle';
        btn.type = 'button';

        function render() {
            var dark = root.getAttribute('data-theme') === 'dark';
            btn.innerHTML = '<i class="bi ' + (dark ? 'bi-sun-fill' : 'bi-moon-fill') + '"></i>';
            btn.setAttribute('aria-label', dark ? 'Light mode' : 'Dark mode');
        }

        btn.addEventListener('click', function () {
            var dark = root.getAttribute('data-theme') !== 'dark';
            if (dark) root.setAttribute('data-theme', 'dark');
            else root.removeAttribute('data-theme');
            try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
            render();
        });

        render();
        document.body.appendChild(btn);
    });
})();
