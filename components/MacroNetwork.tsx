'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SECTORS, EDGES, type ImpactResult } from '@/lib/macroData';

interface Props {
  impacts: Record<string, ImpactResult> | null;
  onNodeClick: (id: string) => void;
  selectedNode: string | null;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  color: string;
  trigger?: boolean;
  impact?: ImpactResult;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  weight: number;
  active: boolean;
}

export default function MacroNetwork({ impacts, onNodeClick, selectedNode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = svgRef.current.clientWidth  || 780;
    const H = svgRef.current.clientHeight || 560;

    const nodes: SimNode[] = Object.entries(SECTORS).map(([id, s]) => ({
      id,
      label: s.label,
      color: s.color,
      trigger: s.trigger,
      impact: impacts?.[id],
    }));

    const links: SimLink[] = EDGES.map(e => ({
      source: e.from,
      target: e.to,
      weight: e.weight,
      active: !!(impacts && (impacts[e.from] || impacts[e.to])),
    }));

    // Fixed seed positions for initial layout
    const fixedPos: Record<string, [number, number]> = {
      GEOPOLITICS:     [W * 0.22, H * 0.13],
      MONETARY_POLICY: [W * 0.78, H * 0.13],
      OIL_ENERGY:      [W * 0.10, H * 0.36],
      EQUITY_MARKETS:  [W * 0.50, H * 0.36],
      CURRENCIES_FX:   [W * 0.90, H * 0.36],
      AVIATION_TRAVEL: [W * 0.10, H * 0.60],
      COMMODITIES:     [W * 0.32, H * 0.60],
      INSURANCE:       [W * 0.62, H * 0.60],
      CREDIT_BANKING:  [W * 0.90, H * 0.60],
      EMPLOYMENT:      [W * 0.10, H * 0.85],
      ECOMMERCE:       [W * 0.32, H * 0.85],
      CONSUMER:        [W * 0.50, H * 0.85],
      REAL_ESTATE:     [W * 0.75, H * 0.85],
    };

    nodes.forEach(n => {
      const fp = fixedPos[n.id];
      if (fp) { n.x = fp[0]; n.y = fp[1]; n.fx = fp[0]; n.fy = fp[1]; }
    });

    svg.append('defs').html(`
      <filter id="glow-sm"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="glow-md"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <marker id="arrow" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.12)"/>
      </marker>
      <marker id="arrow-hi" markerWidth="6" markerHeight="6" refX="22" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,176,32,0.6)"/>
      </marker>
    `);

    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');

    // Draw links
    const linkSel = linkGroup.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', d => d.active ? 'rgba(255,176,32,0.5)' : 'rgba(255,255,255,0.07)')
      .attr('stroke-width', d => d.active ? d.weight * 2.5 : 0.8)
      .attr('marker-end', d => d.active ? 'url(#arrow-hi)' : 'url(#arrow)')
      .attr('opacity', d => d.active ? 0.7 : 0.4);

    // Draw nodes
    const nodeSel = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (_, d) => onNodeClick(d.id));

    // Outer glow ring for active nodes
    nodeSel.filter(d => !!d.impact).append('circle')
      .attr('r', 38)
      .attr('fill', d => d.color + '18')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.6)
      .attr('filter', 'url(#glow-md)');

    // Main circle
    nodeSel.append('circle')
      .attr('r', 28)
      .attr('fill', d => d.impact ? d.color + '1a' : 'rgba(255,255,255,0.03)')
      .attr('stroke', d => d.id === selectedNode ? d.color : (d.impact ? d.color : 'rgba(255,255,255,0.15)'))
      .attr('stroke-width', d => d.id === selectedNode ? 2.5 : 1.5)
      .attr('filter', d => d.impact ? 'url(#glow-sm)' : 'none');

    // Trigger badge
    nodeSel.filter(d => !!d.trigger).append('text')
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '8')
      .attr('font-weight', '700')
      .attr('fill', 'rgba(255,176,32,0.65)')
      .attr('letter-spacing', '0.1em')
      .text('TRIGGER');

    // Impact value
    nodeSel.filter(d => !!d.impact).append('text')
      .attr('y', -7)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10')
      .attr('font-weight', '700')
      .attr('fill', d => (d.impact!.impact > 0 ? '#ff5252' : '#00e676'))
      .text(d => {
        const pct = (d.impact!.impact * 100).toFixed(0);
        return (d.impact!.impact > 0 ? '+' : '') + pct + '%';
      });

    // Label line 1
    nodeSel.append('text')
      .attr('y', d => d.impact ? 8 : 4)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '8')
      .attr('font-weight', '600')
      .attr('fill', 'rgba(255,255,255,0.72)')
      .text(d => d.label.split(' ').slice(0, 2).join(' '));

    nodeSel.filter(d => d.label.split(' ').length > 2).append('text')
      .attr('y', d => d.impact ? 19 : 15)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '8')
      .attr('font-weight', '600')
      .attr('fill', 'rgba(255,255,255,0.72)')
      .text(d => d.label.split(' ').slice(2).join(' '));

    // Confidence arc
    nodeSel.filter(d => !!d.impact).each(function(d) {
      const arcR = 32;
      const endDeg = d.impact!.conf * 360;
      const rad = (a: number) => ((a - 90) * Math.PI) / 180;
      const x1 = arcR * Math.cos(rad(0)), y1 = arcR * Math.sin(rad(0));
      const x2 = arcR * Math.cos(rad(endDeg)), y2 = arcR * Math.sin(rad(endDeg));
      const large = endDeg > 180 ? 1 : 0;
      d3.select(this).append('path')
        .attr('d', `M${x1},${y1} A${arcR},${arcR} 0 ${large} 1 ${x2},${y2}`)
        .attr('fill', 'none')
        .attr('stroke', d.color)
        .attr('stroke-width', '1.5')
        .attr('opacity', 0.45)
        .attr('stroke-linecap', 'round');
    });

    // Hover tooltip
    nodeSel
      .on('mouseover', function(_, d) {
        d3.select(this).select('circle:nth-child(2)').attr('stroke-width', 2.5);
      })
      .on('mouseout', function(_, d) {
        d3.select(this).select('circle:nth-child(2)')
          .attr('stroke-width', d.id === selectedNode ? 2.5 : 1.5);
      });

    // Position update function
    function ticked() {
      linkSel.attr('d', (d: SimLink) => {
        const s = d.source as SimNode;
        const t = d.target as SimNode;
        if (!s.x || !s.y || !t.x || !t.y) return '';
        const mx = (s.x + t.x) / 2;
        const my = (s.y + t.y) / 2 - 25;
        return `M${s.x},${s.y} Q${mx},${my} ${t.x},${t.y}`;
      });
      nodeSel.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    }

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links).id(d => d.id).distance(110).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
      .on('tick', ticked);

    simRef.current = sim;
    ticked();

    return () => { sim.stop(); };
  }, [impacts, selectedNode, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="560"
      style={{ display: 'block', overflow: 'visible' }}
    />
  );
}
