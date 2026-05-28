(function () {
    'use strict';

    // Mark active nav link
    var path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav-links a').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === path || (path === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Phase progress on instruction pages
    var phaseMap = {
        'construction.html': 1,
        'setup.html': 2,
        'operation.html': 3
    };
    if (phaseMap[path]) {
        var step = phaseMap[path];
        document.querySelectorAll('.phase-step').forEach(function (el, i) {
            if (i + 1 <= step) el.classList.add('active');
        });
    }

    // Collapsible panels
    document.querySelectorAll('.collapsible').forEach(function (panel) {
        var trigger = panel.querySelector('.collapsible-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', function () {
            panel.classList.toggle('open');
            trigger.setAttribute('aria-expanded', panel.classList.contains('open'));
        });
    });

    // Development / Production workflow toggle (operation page)
    var workflowToggle = document.getElementById('workflow-toggle');
    if (workflowToggle) {
        var workflowButtons = workflowToggle.querySelectorAll('.workflow-toggle-btn');
        var workflowCollapsibles = document.querySelectorAll('.collapsible[data-workflow]');

        function setWorkflow(mode) {
            workflowButtons.forEach(function (btn) {
                var active = btn.dataset.workflow === mode;
                btn.classList.toggle('active', active);
                btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            workflowCollapsibles.forEach(function (panel) {
                var open = panel.dataset.workflow === mode;
                panel.classList.toggle('open', open);
                var trigger = panel.querySelector('.collapsible-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
            try {
                localStorage.setItem('mattbot-workflow', mode);
            } catch (e) { /* ignore */ }
        }

        var savedWorkflow = 'development';
        try {
            var stored = localStorage.getItem('mattbot-workflow');
            if (stored === 'development' || stored === 'production') savedWorkflow = stored;
        } catch (e) { /* ignore */ }

        setWorkflow(savedWorkflow);

        workflowButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                setWorkflow(btn.dataset.workflow);
            });
        });
    }

    // Open first collapsible by default on pages with data-open-first
    if (document.body.dataset.openFirst === 'true') {
        var first = document.querySelector('.collapsible');
        if (first) first.classList.add('open');
    }

    // Copy-to-clipboard for code blocks
    document.querySelectorAll('.code-wrap').forEach(function (wrap) {
        var block = wrap.querySelector('.code-block');
        var btn = wrap.querySelector('.copy-btn');
        if (!block || !btn) return;
        btn.addEventListener('click', function () {
            var text = block.innerText.replace(/\u00a0/g, ' ').trim();
            navigator.clipboard.writeText(text).then(function () {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });

    // Table of contents + scroll spy
    var tocNav = document.getElementById('page-toc');
    if (tocNav) {
        var headings = document.querySelectorAll('.page-layout [id]');
        var tocList = document.createElement('ul');
        headings.forEach(function (h) {
            if (!h.id || h.tagName === 'H1') return;
            var li = document.createElement('li');
            if (h.tagName === 'H3') li.className = 'toc-h3';
            var a = document.createElement('a');
            a.href = '#' + h.id;
            a.textContent = h.textContent.replace(/^\d+\.\s*/, '');
            li.appendChild(a);
            tocList.appendChild(li);
        });
        tocNav.appendChild(tocList);

        var tocLinks = tocNav.querySelectorAll('a');
        var toggle = document.getElementById('toc-toggle');
        var sidebar = document.querySelector('.toc-sidebar');
        if (toggle && sidebar) {
            toggle.addEventListener('click', function () {
                sidebar.classList.toggle('mobile-open');
                toggle.textContent = sidebar.classList.contains('mobile-open')
                    ? 'Hide contents'
                    : 'Show page contents';
            });
        }

        if (tocLinks.length && 'IntersectionObserver' in window) {
            var observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            var id = entry.target.id;
                            tocLinks.forEach(function (link) {
                                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                            });
                        }
                    });
                },
                { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
            );
            headings.forEach(function (h) {
                if (h.id) observer.observe(h);
            });
        }
    }

    // Repo search filter
    var repoSearch = document.getElementById('repo-search');
    if (repoSearch) {
        repoSearch.addEventListener('input', function () {
            var q = repoSearch.value.toLowerCase().trim();
            document.querySelectorAll('.repo-card').forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.classList.toggle('hidden', q.length > 0 && text.indexOf(q) === -1);
            });
        });
    }

    // Image lightbox
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    if (lightbox && lightboxImg) {
        document.querySelectorAll('.section-image, .img-responsive, .img-pair img').forEach(function (img) {
            img.addEventListener('click', function () {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('open');
            });
        });
        lightbox.addEventListener('click', function () {
            lightbox.classList.remove('open');
        });
    }

    // Back to top
    var backBtn = document.getElementById('backToTop');
    if (backBtn) {
        window.addEventListener('scroll', function () {
            backBtn.classList.toggle('visible', window.pageYOffset > 300);
        });
        backBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
