
// Graph.jsx — Force-directed thought graph on Canvas
const { useRef, useEffect, useCallback, useState } = React;

const PRIMARY = '#6E54FF';
const PRIMARY_BRIGHT = '#9B8AFF';
const PRIMARY_DEEP = '#5240CC';
const SUCCESS = '#4DECAA';

function initPhysics(nodes, W, H) {
  const cx = W / 2, cy = H / 2;
  return nodes.map((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    const r = n.isRoot ? 0 : 80 + Math.random() * 120;
    return {
      ...n,
      x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
      y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
      vx: 0, vy: 0,
      alpha: 0,
    };
  });
}

function tick(physNodes, edges, W, H) {
  const SPRING_K = 0.04, SPRING_L = 110, REPULSION = 3500, DAMPING = 0.82, GRAVITY = 0.012;
  const nodes = physNodes;

  nodes.forEach(n => { n.fx = 0; n.fy = 0; });

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const d2 = dx * dx + dy * dy + 1;
      const f = REPULSION / d2;
      const d = Math.sqrt(d2);
      nodes[i].fx -= f * dx / d;
      nodes[i].fy -= f * dy / d;
      nodes[j].fx += f * dx / d;
      nodes[j].fy += f * dy / d;
    }
  }

  // Springs
  edges.forEach(e => {
    const a = nodes.find(n => n.id === e.source);
    const b = nodes.find(n => n.id === e.target);
    if (!a || !b) return;
    const dx = b.x - a.x, dy = b.y - a.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const f = SPRING_K * (d - SPRING_L);
    a.fx += f * dx / d; a.fy += f * dy / d;
    b.fx -= f * dx / d; b.fy -= f * dy / d;
  });

  // Gravity to center
  nodes.forEach(n => {
    n.fx += GRAVITY * (W / 2 - n.x);
    n.fy += GRAVITY * (H / 2 - n.y);
  });

  // Integrate
  nodes.forEach(n => {
    n.vx = (n.vx + n.fx) * DAMPING;
    n.vy = (n.vy + n.fy) * DAMPING;
    n.x = Math.max(36, Math.min(W - 36, n.x + n.vx));
    n.y = Math.max(36, Math.min(H - 36, n.y + n.vy));
    n.alpha = Math.min(1, (n.alpha || 0) + 0.06);
  });

  return nodes;
}

function draw(canvas, physNodes, edges) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Grid dots
  ctx.fillStyle = 'rgba(110,84,255,0.06)';
  for (let x = 20; x < W; x += 34) {
    for (let y = 20; y < H; y += 34) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Edges
  edges.forEach(e => {
    const a = physNodes.find(n => n.id === e.source);
    const b = physNodes.find(n => n.id === e.target);
    if (!a || !b) return;
    const alpha = Math.min(a.alpha, b.alpha) * 0.5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(110,84,255,${alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Edge label
    if (e.label) {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.fillStyle = `rgba(136,136,176,${alpha * 0.7})`;
      ctx.font = '8px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(e.label, mx, my - 4);
    }
  });

  // Nodes
  physNodes.forEach(n => {
    const alpha = n.alpha || 0;
    const sz = n.isRoot ? 38 : n.type === 'branch' ? 26 : 18;
    const color = n.isRoot ? PRIMARY : n.type === 'branch' ? PRIMARY_BRIGHT : PRIMARY_DEEP;
    const highlight = n.isNew ? SUCCESS : color;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(n.x, n.y);

    // Glow
    ctx.shadowColor = highlight;
    ctx.shadowBlur = n.isRoot ? 18 : n.isNew ? 14 : 8;

    // Fill
    ctx.fillStyle = highlight;
    ctx.fillRect(-sz / 2, -sz / 2, sz, sz);

    // Inner accent
    if (n.isRoot) {
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(-sz / 2 + 3, -sz / 2 + 3, sz - 6, 3);
    }

    ctx.shadowBlur = 0;

    // Label text
    ctx.fillStyle = n.isRoot ? '#07070E' : 'rgba(236,238,248,0.9)';
    ctx.font = `${n.isRoot ? 600 : 500} ${n.isRoot ? 9 : 8}px DM Sans`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxW = sz - 4;
    const label = n.label || '';
    if (label.length > 8) {
      ctx.font = `500 7px DM Sans`;
    }
    ctx.fillText(label.slice(0, 10), 0, 0);
    ctx.textBaseline = 'alphabetic';

    // Hash below
    ctx.fillStyle = `rgba(136,136,176,${alpha * 0.6})`;
    ctx.font = '7px JetBrains Mono';
    ctx.fillText(n.hash || '', 0, sz / 2 + 10);

    // Module icon dot
    if (n.module) {
      const mc = n.module === 'synaptrac' ? PRIMARY : n.module === 'kmerge' ? SUCCESS : '#FFB84D';
      ctx.fillStyle = mc;
      ctx.fillRect(sz / 2 - 5, -sz / 2, 5, 5);
    }

    ctx.restore();
  });
}

function GraphCanvas({ nodes, edges, width, height, mini }) {
  const canvasRef = useRef(null);
  const physRef = useRef([]);
  const rafRef = useRef(null);
  const prevLen = useRef(0);

  useEffect(() => {
    const W = width || 400, H = height || 400;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;

    if (nodes.length !== prevLen.current) {
      // Re-init only new nodes, keep existing positions
      const existing = physRef.current;
      const newPhys = nodes.map(n => {
        const found = existing.find(e => e.id === n.id);
        if (found) return { ...found, ...n };
        const angle = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * 80;
        return {
          ...n,
          x: W / 2 + Math.cos(angle) * r,
          y: H / 2 + Math.sin(angle) * r,
          vx: 0, vy: 0, alpha: 0, isNew: true,
        };
      });
      physRef.current = newPhys;
      prevLen.current = nodes.length;
    }

    const animate = () => {
      physRef.current = tick(physRef.current, edges, W, H);
      draw(canvas, physRef.current, edges);
      rafRef.current = requestAnimationFrame(animate);
    };

    if (!rafRef.current) animate();

    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [nodes, edges, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
    />
  );
}

Object.assign(window, { GraphCanvas });
