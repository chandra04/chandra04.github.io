// Navigation behaviour:
//  - compacts the bar and adds a shadow once you scroll
//  - highlights the link for the section currently on screen
//  - closes the mobile menu after a link is tapped
// The page still works fully if this file fails to load.
(function () {
    var nav = document.querySelector('nav');
    var toggle = document.getElementById('nav-toggle');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));

    function onScroll() {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    links.forEach(function (a) {
        a.addEventListener('click', function () {
            if (toggle) toggle.checked = false;
        });
    });

    // Close the mobile menu with Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggle) toggle.checked = false;
    });

    if (!('IntersectionObserver' in window)) return;

    var byId = {};
    links.forEach(function (a) {
        byId[a.getAttribute('href').slice(1)] = a;
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            links.forEach(function (l) { l.classList.remove('active'); });
            var link = byId[entry.target.id];
            if (link) link.classList.add('active');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(byId).forEach(function (id) {
        var section = document.getElementById(id);
        if (section) observer.observe(section);
    });

    // Clear the highlight when back at the top (hero)
    var hero = document.getElementById('home');
    if (hero) {
        new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                links.forEach(function (l) { l.classList.remove('active'); });
            }
        }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
    }
})();

// "CV last updated" date in the About section.
// Asks the GitHub API for the most recent commit that touched the CV PDF,
// so the date updates by itself every time you push a new CV.
// If GitHub can't be reached, the date written in index.html stays as-is.
(function () {
    var el = document.getElementById('cv-date');
    if (!el || !window.fetch) return;

    var repo = el.getAttribute('data-repo');
    var file = el.getAttribute('data-file');
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var cacheKey = 'cv-date:' + repo + ':' + file;

    function show(iso) {
        var d = new Date(iso);
        if (isNaN(d)) return;
        el.textContent = months[d.getMonth()] + '-' + d.getFullYear();
        el.setAttribute('datetime', iso.slice(0, 10));
        el.title = 'CV last updated ' + d.toDateString();
    }

    // Reuse the answer for this browser tab so we only ask GitHub once per visit
    try {
        var cached = sessionStorage.getItem(cacheKey);
        if (cached) { show(cached); return; }
    } catch (e) { /* storage unavailable: just fetch */ }

    fetch('https://api.github.com/repos/' + repo + '/commits?path=' +
          encodeURIComponent(file) + '&per_page=1')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (commits) {
            if (!commits || !commits.length) return;
            var iso = commits[0].commit.committer.date;
            show(iso);
            try { sessionStorage.setItem(cacheKey, iso); } catch (e) {}
        })
        .catch(function () { /* keep fallback text */ });
})();
