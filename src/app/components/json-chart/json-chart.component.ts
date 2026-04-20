import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const IS_NUMBER = (v: any) => typeof v === 'number';

interface RowData {
  key: string;
  value: string;
  type: 'nil' | 'num' | 'val' | 'summary';
  isNode: boolean;
  childId?: string;
  colorSquare?: string;
}

interface VisualNode {
  id: string;
  title: string;
  rows: RowData[];
  x: number;
  y: number;
  width: number;
  height: number;
  children: VisualNode[];
}

interface VisualEdge {
  d: string;
}

@Component({
  selector: 'app-json-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-wrapper" [class.dark]="dark" #wrapper (wheel)="onWheel($event)" (mousedown)="onMouseDown($event)" (mousemove)="onMouseMove($event)" (mouseup)="onMouseUp()" (mouseleave)="onMouseUp()">
      <div class="controls-overlay">
        <button class="control-btn" (click)="zoomIn()" title="Zoom In">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 5v14M5 12h14"/></svg>
        </button>
        <button class="control-btn" (click)="zoomOut()" title="Zoom Out">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M5 12h14"/></svg>
        </button>
        <button class="control-btn" (click)="centerGraph()" title="Fit to screen">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10z"/></svg>
        </button>
      </div>

      <div class="canvas" [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoom + ')'" [style.width.px]="canvasWidth" [style.height.px]="canvasHeight">
        <svg class="edges" [attr.width]="canvasWidth" [attr.height]="canvasHeight">
          <path *ngFor="let edge of edges" [attr.d]="edge.d" fill="none" [attr.stroke]="dark ? '#555' : '#bbb'" stroke-width="1.5" />
        </svg>

        <div *ngFor="let node of nodes" class="node-card" [class.dark]="dark" [style.left.px]="node.x" [style.top.px]="node.y" [style.width.px]="node.width">
          <div class="node-title" *ngIf="node.title">{{node.title}}</div>
          <div class="node-rows">
            <div *ngFor="let row of node.rows" class="node-row" [class.is-link]="row.isNode">
              <span class="row-key">{{row.key}}</span>
              <span class="row-val" [ngClass]="row.type">
                <span *ngIf="row.colorSquare" class="color-square" [style.background-color]="row.colorSquare"></span>
                {{row.value}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; overflow: hidden; background-color: transparent; }
    .chart-wrapper {
      width: 100%; height: 100%; cursor: grab; position: relative;
      background-image:
        linear-gradient(rgba(108,92,231,0.07) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108,92,231,0.07) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .chart-wrapper:active { cursor: grabbing; }
    .controls-overlay {
      position: absolute; bottom: 24px; right: 24px;
      display: flex; flex-direction: column; gap: 8px; z-index: 100;
    }
    .control-btn {
      width: 36px; height: 36px; border-radius: 6px;
      background: #ffffff; border: 1px solid #d2d2d2; color: #333;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.2s; padding: 0;
    }
    .control-btn:hover { background: #f0f0f0; }
    .chart-wrapper.dark .control-btn { background: #2a2a2a; border-color: #444; color: #abb2bf; }
    .chart-wrapper.dark .control-btn:hover { background: #3a3a3a; }
    .canvas {
      position: relative; transform-origin: 0 0;
      will-change: transform;
    }
    .edges {
      position: absolute; top: 0; left: 0; pointer-events: none; overflow: visible;
    }
    .node-card {
      position: absolute;
      background: #ffffff;
      border: 1px solid #d2d2d2;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #333;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      z-index: 10;
    }
    .node-card.dark {
      background: #2a2a2a;
      border: 1px solid #444;
      color: #abb2bf;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .node-title {
      padding: 8px 12px;
      font-weight: 600;
      color: #8A2BE2;
      border-bottom: 1px solid #eaeaea;
      text-align: center;
    }
    .node-card.dark .node-title {
      border-bottom-color: #444;
      color: #c678dd;
    }
    .node-rows {
      display: flex;
      flex-direction: column;
    }
    .node-row {
      display: flex;
      padding: 6px 12px;
      border-bottom: 1px solid #eaeaea;
      justify-content: space-between;
      height: 29px;
      box-sizing: border-box;
      align-items: center;
    }
    .node-row:last-child {
      border-bottom: none;
    }
    .node-card.dark .node-row {
      border-bottom-color: #444;
    }
    .row-key {
      color: #8A2BE2;
      margin-right: 12px;
      font-weight: 500;
      white-space: nowrap;
    }
    .node-card.dark .row-key {
      color: #c678dd;
    }
    .row-val {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .color-square {
      width: 12px; height: 12px; border-radius: 2px; border: 1px solid rgba(0,0,0,0.2);
      display: inline-block;
    }
    .val { color: #333; }
    .node-card.dark .val { color: #abb2bf; }
    .num { color: #ff0033; }
    .node-card.dark .num { color: #e06c75; }
    .nil { color: #999; font-style: italic; }
    .summary { color: #666; }
    .node-card.dark .summary { color: #888; }
  `]
})
export class JsonChartComponent implements OnChanges {
  @Input() data: any = null;
  @Input() dark = false;

  @ViewChild('wrapper') wrapper!: ElementRef;

  nodes: VisualNode[] = [];
  edges: VisualEdge[] = [];
  
  canvasWidth = 2000;
  canvasHeight = 2000;

  zoom = 1;
  panX = 50;
  panY = 50;

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private nodeIdCounter = 0;
  
  private readonly ROW_HEIGHT = 29;
  private readonly HEADER_HEIGHT = 36;
  private readonly VERTICAL_SPACING = 20;
  private readonly HORIZONTAL_SPACING = 100;
  private readonly NODE_WIDTH = 220;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['dark']) {
      if (this.data) {
        this.buildGraph();
      }
    }
  }

  @HostListener('window:resize')
  onResize() {
    // Keep standard resizing behavior
  }

  onWheel(e: WheelEvent) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomSensitivity = 0.002;
      const delta = -e.deltaY * zoomSensitivity;
      let newZoom = this.zoom * (1 + delta);
      newZoom = Math.max(0.2, Math.min(newZoom, 4));
      
      const rect = this.wrapper.nativeElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
    } else {
      // Allow natural scroll to be mapped to pan if desired, or let users scroll normally.
      // Echarts default behavior is wheel to zoom. We'll map all wheel to zoom here for simplicity,
      // just like node editors.
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      let newZoom = this.zoom * (1 + delta);
      newZoom = Math.max(0.2, Math.min(newZoom, 4));
      
      const rect = this.wrapper.nativeElement.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
    }
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.startX = e.clientX - this.panX;
    this.startY = e.clientY - this.panY;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this.panX = e.clientX - this.startX;
    this.panY = e.clientY - this.startY;
  }

  onMouseUp() {
    this.isDragging = false;
  }

  zoomIn() {
    this.applyZoom(1.3);
  }

  zoomOut() {
    this.applyZoom(1 / 1.3);
  }

  private applyZoom(factor: number) {
    let newZoom = this.zoom * factor;
    newZoom = Math.max(0.1, Math.min(newZoom, 4));
    
    if (this.wrapper) {
      const rect = this.wrapper.nativeElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const mouseX = w / 2;
      const mouseY = h / 2;
      this.panX = mouseX - (mouseX - this.panX) * (newZoom / this.zoom);
      this.panY = mouseY - (mouseY - this.panY) * (newZoom / this.zoom);
    }
    
    this.zoom = newZoom;
  }

  centerGraph() {
    if (!this.wrapper || this.nodes.length === 0) return;
    const w = this.wrapper.nativeElement.clientWidth;
    const h = this.wrapper.nativeElement.clientHeight;
    
    const maxX = Math.max(...this.nodes.map(n => n.x + n.width));
    const maxY = Math.max(...this.nodes.map(n => n.y + n.height));
    
    const graphW = maxX + 100;
    const graphH = maxY + 100;
    
    if (w > 0 && h > 0) {
      const scaleX = w / graphW;
      const scaleY = h / graphH;
      let newZoom = Math.min(scaleX, scaleY, 1);
      newZoom = Math.max(0.1, newZoom);
      
      this.zoom = newZoom;
      this.panX = (w - (graphW * newZoom)) / 2;
      this.panY = (h - (graphH * newZoom)) / 2;
    }
  }

  private buildGraph() {
    this.nodes = [];
    this.edges = [];
    this.nodeIdCounter = 0;

    const root = this.createVisualTree(this.data, 'root', true);
    
    // Y-Layout Algorithm
    let currentY = 50; // padding top
    
    const layoutY = (node: VisualNode) => {
      if (node.children.length === 0) {
        node.y = currentY;
        currentY += node.height + this.VERTICAL_SPACING;
      } else {
        for (const child of node.children) {
          layoutY(child);
        }
        const first = node.children[0];
        const last = node.children[node.children.length - 1];
        const centerChildrenY = (first.y + last.y + last.height - node.height) / 2;
        node.y = Math.max(centerChildrenY, currentY);
        currentY = Math.max(currentY, node.y + node.height + this.VERTICAL_SPACING);
      }
    };

    layoutY(root);

    // X-Layout Algorithm
    const layoutX = (node: VisualNode, x: number) => {
      node.x = x;
      for (const child of node.children) {
        layoutX(child, x + node.width + this.HORIZONTAL_SPACING);
      }
    };

    layoutX(root, 50); // padding left

    const maxY = Math.max(...this.nodes.map(n => n.y + n.height));
    const maxX = Math.max(...this.nodes.map(n => n.x + n.width));
    
    this.canvasWidth = Math.max(2000, maxX + 200);
    this.canvasHeight = Math.max(2000, maxY + 200);

    // Center and zoom to fit
    setTimeout(() => this.centerGraph(), 0);
    
    this.buildEdges(root);
  }

  private createVisualTree(value: any, name: string, isRoot: boolean): VisualNode {
    const id = `node_${this.nodeIdCounter++}`;
    const title = (!isRoot && name) ? name : (isRoot ? (Array.isArray(value) ? 'root []' : 'root {}') : '');
    const node: VisualNode = {
      id, title, rows: [],
      x: 0, y: 0, width: this.NODE_WIDTH, height: 0, children: []
    };

    if (value === null || value === undefined) {
      node.rows.push({ key: 'value:', value: 'null', type: 'nil', isNode: false });
    } else if (typeof value !== 'object') {
      const { valStr, style, color } = this.formatPrimitive(value);
      node.rows.push({ key: 'value:', value: valStr, type: style as any, isNode: false, colorSquare: color });
    } else if (Array.isArray(value)) {
      if (!isRoot) {
        node.rows.push({ key: 'items:', value: `[ ${value.length} items ]`, type: 'summary', isNode: false });
      } else if (value.length === 0) {
        node.rows.push({ key: 'items:', value: `[ 0 items ]`, type: 'summary', isNode: false });
      }
      value.forEach((v, i) => {
        node.children.push(this.createVisualTree(v, `[${i}]`, false));
      });
    } else {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        node.rows.push({ key: 'value:', value: '{}', type: 'summary', isNode: false });
      } else {
        for (const [k, v] of entries) {
          if (v === null || typeof v !== 'object') {
            const { valStr, style, color } = this.formatPrimitive(v);
            node.rows.push({ key: `${k}:`, value: valStr, type: style as any, isNode: false, colorSquare: color });
          } else {
            const isArr = Array.isArray(v);
            const count = isArr ? v.length : Object.keys(v).length;
            const summaryText = isArr ? `[ ${count} items ]` : `{ ${count} keys }`;
            
            const childNode = this.createVisualTree(v, k, false);
            node.children.push(childNode);
            node.rows.push({ key: `${k}:`, value: summaryText, type: 'summary', isNode: true, childId: childNode.id });
          }
        }
      }
    }

    let h = 0;
    if (node.title) h += this.HEADER_HEIGHT;
    h += node.rows.length * this.ROW_HEIGHT;
    if (node.rows.length === 0 && !node.title) h += this.ROW_HEIGHT; 
    node.height = h;

    this.nodes.push(node);
    return node;
  }

  private buildEdges(node: VisualNode) {
    let currentChildIndex = 0;
    
    for (let r = 0; r < node.rows.length; r++) {
      const row = node.rows[r];
      if (row.isNode && row.childId) {
        const child = node.children[currentChildIndex];
        if (child && child.id === row.childId) {
          
          let rowYOffset = 0;
          if (node.title) rowYOffset += this.HEADER_HEIGHT;
          rowYOffset += (r * this.ROW_HEIGHT) + (this.ROW_HEIGHT / 2);

          const startX = node.x + node.width;
          const startY = node.y + rowYOffset;
          
          const endX = child.x;
          let endY = child.y;
          if (child.title) endY += this.HEADER_HEIGHT / 2;
          else endY += this.ROW_HEIGHT / 2;

          const controlX = (startX + endX) / 2;

          this.edges.push({
            d: `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`
          });
          
          currentChildIndex++;
        }
      }
    }
    
    if (node.children.length > 0 && currentChildIndex === 0) {
      const startX = node.x + node.width;
      const startY = node.y + node.height / 2;

      for (const child of node.children) {
        const endX = child.x;
        let endY = child.y;
        if (child.title) endY += this.HEADER_HEIGHT / 2;
        else endY += this.ROW_HEIGHT / 2;

        const controlX = (startX + endX) / 2;
        this.edges.push({
           d: `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`
        });
      }
    }

    for (const child of node.children) {
      this.buildEdges(child);
    }
  }

  private formatPrimitive(v: any): { valStr: string, style: string, color?: string } {
    let valStr = String(v);
    let style = 'val';
    let color: string | undefined;

    if (v === null) { valStr = 'null'; style = 'nil'; }
    else if (IS_NUMBER(v)) { style = 'num'; }
    else if (HEX_COLOR.test(valStr)) { 
      color = valStr;
      style = 'val'; 
    }
    else if (valStr.length > 24) { valStr = valStr.slice(0, 24) + '…'; }
    
    return { valStr, style, color };
  }
}

