(() => {
  const task = document.body.dataset.task;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && task !== 'channel' && window.Lenis) {
    const scroll = new window.Lenis({ autoRaf: true, anchors: true, lerp: 0.09, wheelMultiplier: 0.9 });
    document.addEventListener('visibilitychange', () => document.hidden ? scroll.stop() : scroll.start());
    window.addEventListener('pagehide', () => scroll.destroy(), { once: true });
  }

  const gsap = window.gsap;
  if (!gsap || reduced) return;
  document.body.classList.add('has-gsap');
  gsap.defaults({ ease: 'power3.out' });

  const entrances = {
    store: ['.hero-copy > .eyebrow', '.hero-copy h1', '.hero-copy > p', '.hero-copy > .button', '.hero-footnote'],
    board: ['.board-intro > *', '.board-topline'],
    channel: ['.channel-intro > *', '.channel-workspace']
  }[task] || [];

  entrances.forEach((selector, index) => {
    const target = document.querySelectorAll(selector);
    if (target.length) gsap.fromTo(target, { autoAlpha: 0, y: 16 }, {
      autoAlpha: 1, y: 0, duration: 0.52, delay: index * 0.045,
      stagger: 0.055, clearProps: 'transform,opacity,visibility'
    });
  });

  if (task === 'store') {
    gsap.fromTo('.hero-art', { autoAlpha: 0, scale: 0.985 }, {
      autoAlpha: 1, scale: 1, duration: 0.75, delay: 0.14,
      clearProps: 'transform,opacity,visibility'
    });
    gsap.to('.object-tote', { y: -7, rotation: 1.2, duration: 2.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.object-headphones', { y: 5, rotation: -1.5, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  const seen = new WeakSet();
  const reveal = (nodes, direction = 'y') => {
    const fresh = nodes.filter(node => node instanceof Element && !seen.has(node));
    if (!fresh.length) return;
    fresh.forEach(node => seen.add(node));
    gsap.fromTo(fresh,
      direction === 'x' ? { autoAlpha: 0.45, x: 24 } : { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, x: 0, y: 0, duration: 0.42, stagger: 0.045, overwrite: true,
        clearProps: 'transform,opacity,visibility' }
    );
  };

  const watch = (root, selector) => {
    if (!root) return;
    const observer = new MutationObserver(records => {
      const nodes = [];
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches(selector)) nodes.push(node);
        node.querySelectorAll(selector).forEach(child => nodes.push(child));
      }));
      reveal(nodes);
    });
    observer.observe(root, { childList: true, subtree: true });
    reveal(Array.from(root.querySelectorAll(selector)));
  };

  if (task === 'store') watch(document.querySelector('#product-grid'), '.product-card');
  if (task === 'board') {
    watch(document.querySelector('#task-columns'), '.task-card');
    const name = document.querySelector('#project-name');
    if (name) new MutationObserver(() => reveal(Array.from(document.querySelectorAll('#task-columns .task-column')), 'x'))
      .observe(name, { childList: true, characterData: true, subtree: true });
  }
  if (task === 'channel') {
    watch(document.querySelector('#chat-log'), '.chat-message');
    watch(document.querySelector('#video-grid'), '.video-tile:not(.local-tile)');
    const room = document.querySelector('#room-active');
    if (room) new MutationObserver(() => {
      if (room.classList.contains('hidden')) return;
      reveal(Array.from(room.querySelectorAll('.room-header, .room-tabs, .room-panel.active')));
    }).observe(room, { attributes: true, attributeFilter: ['class'] });
  }

  document.querySelectorAll('dialog').forEach(dialog => {
    new MutationObserver(() => {
      if (!dialog.open) return;
      const card = dialog.querySelector('.modal-card, .drawer-card');
      if (card) gsap.fromTo(card, { autoAlpha: 0, y: 12 }, {
        autoAlpha: 1, y: 0, duration: 0.3, clearProps: 'transform,opacity,visibility'
      });
    }).observe(dialog, { attributes: true, attributeFilter: ['open'] });
  });
})();
