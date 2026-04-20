import { Component, Input, OnChanges, OnDestroy, AfterViewInit, SimpleChanges, ElementRef, NgZone } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { TreeChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TreeChart, TooltipComponent, CanvasRenderer]);

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const IS_NUMBER = (v: any) => typeof v === 'number';

@Component({
  selector: 'app-json-chart',
  standalone: true,
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `<div echarts [options]="chartOptions" [theme]="dark ? 'dark' : ''" [autoResize]="true" class="chart-container" (chartInit)="onChartInit($event)"></div>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .chart-container {
      width: 100%; height: 100%;
      background-image:
        linear-gradient(rgba(108,92,231,0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108,92,231,0.07) 1px, transparent 1px);
      background-size: 28px 28px;
    }
  `]
})
export class JsonChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: any = null;
  @Input() dark = false;

  chartOptions: any = {};
  private chartInstance: any = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private el: ElementRef, private zone: NgZone) {}

  onChartInit(ec: any): void {
    this.chartInstance = ec;
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && this.data) {
        this.zone.run(() => this.computeOptions(width, height));
      }
    });
    this.resizeObserver.observe(this.el.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['dark']) {
      const w = this.el?.nativeElement?.clientWidth || 0;
      const h = this.el?.nativeElement?.clientHeight || 0;
      this.computeOptions(w || 800, h || 600);
      // Call setOption directly to bypass ngx-echarts' change-detection queue
      if (this.chartInstance) {
        this.chartInstance.setOption(this.chartOptions, true);
      }
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private computeOptions(w: number, h: number): void {
    if (!this.data) return;

    const isDark     = this.dark;
    const cardBg     = isDark ? '#2a2a2a' : '#ffffff';
    const cardBorder = isDark ? '#3a3a3a' : '#e0e0e0';
    const lineColor  = isDark ? '#555'    : '#bbb';
    const keyColor   = '#6C5CE7';
    const numColor   = isDark ? '#e06c75' : '#c0392b';
    const valColor   = isDark ? '#abb2bf' : '#2c3e50';
    const nullColor  = '#999';

    const rich: any = {
      key:     { color: keyColor,  fontWeight: '600', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
      val:     { color: valColor,  fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
      num:     { color: numColor,  fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
      nil:     { color: nullColor, fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontStyle: 'italic' },
      summary: { color: isDark ? '#7f7f7f' : '#999', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' },
      title:   { color: keyColor,  fontWeight: '700', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' },
    };

    const tree   = this.toNode(this.data, 'root', rich, cardBg, cardBorder);
    const depth  = this.treeDepth(tree);
    const leaves = this.treeLeaves(tree);
    const zoom   = Math.min(w / (depth * 160), h / (leaves * 80), 1);

    this.chartOptions = {
      backgroundColor: 'transparent',
      tooltip: { show: false },
      series: [{
        type: 'tree',
        data: [tree],
        top: '2%', left: '2%', bottom: '2%', right: '2%',
        symbol: 'emptyCircle',
        symbolSize: 6,
        orient: 'LR',
        edgeShape: 'curve',
        expandAndCollapse: false,
        initialTreeDepth: -1,
        zoom,
        roam: true,
        lineStyle: { color: lineColor, width: 1.5, curveness: 0.5 },
        itemStyle: { color: keyColor, borderColor: keyColor },
        emphasis: { focus: 'descendant' },
        label:  { show: true, position: 'inside', rich },
        leaves: { label: { position: 'inside', rich } },
        animationDuration: 400,
        animationDurationUpdate: 600,
      }]
    };
  }

  private toNode(value: any, name: string, rich: any, cardBg: string, cardBorder: string): any {
    if (value === null || value === undefined) {
      return this.leafNode(name, 'null', 'nil', cardBg, cardBorder);
    }

    if (typeof value !== 'object') {
      return this.leafNode(name, String(value), IS_NUMBER(value) ? 'num' : 'val', cardBg, cardBorder);
    }

    if (Array.isArray(value)) {
      const label = `{title|${name}}\n{summary|[ ${value.length} items ]}`;
      return {
        name: label,
        label: this.cardLabel(label, cardBg, cardBorder),
        symbol: 'emptyCircle',
        children: value.map((v, i) => this.toNode(v, `${name}[${i}]`, rich, cardBg, cardBorder)),
      };
    }

    const entries    = Object.entries(value);
    const primitives = entries.filter(([, v]) => v === null || typeof v !== 'object');
    const nested     = entries.filter(([, v]) => v !== null && typeof v === 'object');

    if (nested.length > 0) {
      // Intermediate node: compact label so it doesn't overlap adjacent levels
      const label = `{title|${name}}\n{summary|\\{ ${entries.length} keys \\}}`;
      return {
        name: label,
        label: this.cardLabel(label, cardBg, cardBorder),
        symbol: 'emptyCircle',
        children: nested.map(([k, v]) => this.toNode(v, k, rich, cardBg, cardBorder)),
      };
    }

    // Leaf object: show all primitive key-value pairs
    const lines = primitives.map(([k, v]) => {
      if (v === null)               return `{key|${k}:} {nil|null}`;
      if (IS_NUMBER(v))             return `{key|${k}:} {num|${v}}`;
      if (HEX_COLOR.test(String(v))) return `{key|${k}:} {val|■ ${v}}`;
      const str = String(v);
      return `{key|${k}:} {val|${str.length > 24 ? str.slice(0, 24) + '…' : str}}`;
    });

    const label = `{title|${name}}` + (lines.length ? '\n' + lines.join('\n') : '');
    return {
      name: label,
      label: this.cardLabel(label, cardBg, cardBorder),
      symbol: 'emptyCircle',
    };
  }

  private leafNode(name: string, value: string, style: string, cardBg: string, cardBorder: string): any {
    const label = `{key|${name}:} {${style}|${value}}`;
    return { name: label, label: this.cardLabel(label, cardBg, cardBorder), symbol: 'emptyCircle' };
  }

  private treeDepth(node: any, d = 0): number {
    if (!node.children?.length) return d;
    return Math.max(...node.children.map((c: any) => this.treeDepth(c, d + 1)));
  }

  private treeLeaves(node: any): number {
    if (!node.children?.length) return 1;
    return node.children.reduce((s: number, c: any) => s + this.treeLeaves(c), 0);
  }

  private cardLabel(formatter: string, bg: string, border: string): any {
    return {
      show: true,
      formatter,
      backgroundColor: bg,
      borderColor: border,
      borderWidth: 1,
      borderRadius: 8,
      padding: [6, 10],
      shadowColor: 'rgba(0,0,0,0.08)',
      shadowBlur: 6,
      position: 'inside',
    };
  }
}
