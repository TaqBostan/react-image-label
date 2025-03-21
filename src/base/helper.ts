const ns = "http://www.w3.org/2000/svg";

interface Event { detail: any }
interface SVGSVGElement {
    circle(r: number): SVGCircleElement;
    ellipse(rx: number, ry: number): SVGEllipseElement;
    rect(w: number, h: number): SVGRectElement;
    polyline(points: [number, number][]): SVGPolylineElement;
    plain(text: string): SVGTextElement;
    path(d: string): SVGPathElement;
    image(url: string, onload: (ev: Event) => any): SVGImageElement;
    size(w: number, h: number): void;
}

interface SVGElement {
    events: {event: string, cb: EventListener}[];
    fill(color: string): this;
    move(x: number, y: number): this;
    addClass(name: string): this;
    removeClass(name: string): this;
    stroke(obj: { color?: string, width?: number, opacity?: number, dasharray?: string }): this;
    attr(name: string, value: string): this;
    increment(d: [x: number, y: number]): void;
    mouseup(cb: (ev: MouseEvent) => any): this;
    mousedown(cb: (ev: MouseEvent) => any): this;
    mousemove(cb: (ev: MouseEvent) => any): this;
    mouseover(cb: (ev: MouseEvent) => any): this;
    mouseout(cb: (ev: MouseEvent) => any): this;
    click(cb: (ev: MouseEvent) => any): this;
    dblclick(cb: (ev: MouseEvent) => any): this;
    on(event: string, cb: (ev: MouseEvent) => any): this;
    off(event: string): this;
    opacity(o: number): this;
}

interface SVGPolylineElement {
    array(): [number, number][];
    plot(points: [number, number][]): void;
}

interface SVGPathElement {
    plot(d: string): void;
}

interface SVGRectElement {
    radius(r: number): SVGRectElement;
}

interface SVGEllipseElement {
    radius(rx: number, ry: number): this;
}

interface SVGCircleElement {
    radius(r: number): this;
    x(x: number): this;
    x(): number;
    y(y: number): this;
    y(): number;
}

interface SVGEllipseElement {
    x(x: number): this;
    x(): number;
    y(y: number): this;
    y(): number;
}

interface SVGTextElement {
    font(size: number, weight: string, fill?: string, anchor?: string): SVGTextElement;
}

interface SVGImageElement {
    size(w: string, h: string): this;
}

SVGSVGElement.prototype.plain = function (text: string) {
    let r = document.createElementNS(ns, 'text') as SVGTextElement;
    r.innerHTML = text;
    this.append(r);
    return r;
}

SVGSVGElement.prototype.path = function (d: string) {
    let p = document.createElementNS(ns, 'path') as SVGPathElement;
    p.plot(d);
    this.append(p);
    return p;
}

SVGPathElement.prototype.plot = function (d: string) {
    this.setAttribute('d', d);
    return this;
}

SVGSVGElement.prototype.circle = function (r: number) {
    let c = document.createElementNS(ns, 'circle');
    c.setAttribute('r', r.toString());
    this.append(c);
    return c;
}

SVGSVGElement.prototype.ellipse = function (rx: number, ry: number) {
    let c = document.createElementNS(ns, 'ellipse');
    c.setAttribute('rx', rx.toString());
    c.setAttribute('ry', ry.toString());
    this.append(c);
    return c;
}

SVGSVGElement.prototype.polyline = function (points: [number, number][]) {
    let c = document.createElementNS(ns, 'polyline');
    c.plot(points);
    this.append(c);
    return c;
}

SVGSVGElement.prototype.image = function (url: string, onload: (ev: Event) => any) {
    let c = document.createElementNS(ns, 'image');
    c.setAttribute('href', url);
    this.appendChild(c);
    c.addEventListener("load", onload);
    return c;
}

SVGSVGElement.prototype.rect = function (w: number, h: number) {
    let r = document.createElementNS(ns, 'rect');
    r.setAttribute('height', h.toString());
    r.setAttribute('width', w.toString());
    this.append(r);
    return r;
}

function size(el: SVGElement, w: string, h: string) {
    if(w) el.setAttribute('width', w);
    else el.removeAttribute('width');
    if(h) el.setAttribute('height', h);
    else el.removeAttribute('height');
}

SVGSVGElement.prototype.size = function(w: number, h: number) { size(this, w.toString(), h.toString()); };
SVGImageElement.prototype.size = function(w: string, h: string) { size(this, w, h); return this; };

function register(el: SVGElement, event: string, cb: EventListener) {
    el.events = el.events || [];
    el.events.push({event, cb: cb});
}


SVGElement.prototype.on = function (event: string, cb: (ev: any) => any) {
    this.addEventListener(event, cb);
    register(this, event, cb as EventListener);
    return this;
}

SVGElement.prototype.mouseup = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('mouseup', cb);
    register(this, 'mouseup', cb as EventListener);
    return this;
}

SVGElement.prototype.mousedown = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('mousedown', cb);
    register(this, 'mousedown', cb as EventListener);
    return this;
}

SVGElement.prototype.mousemove = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('mousemove', cb);
    register(this, 'mousemove', cb as EventListener);
    return this;
}

SVGElement.prototype.mouseover = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('mouseover', cb);
    register(this, 'mouseover', cb as EventListener);
    return this;
}

SVGElement.prototype.mouseout = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('mouseout', cb);
    register(this, 'mouseout', cb as EventListener);
    return this;
}

SVGElement.prototype.click = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('click', cb);
    register(this, 'click', cb as EventListener);
    return this;
}

SVGElement.prototype.dblclick = function (cb: (ev: MouseEvent) => any) {
    this.addEventListener('dblclick', cb);
    register(this, 'dblclick', cb as EventListener);
    return this;
}

SVGElement.prototype.off = function (event: string) {
    this.events = this.events || [];
    this.events.filter(c => c.event === event).forEach(c => {
        this.removeEventListener(c.event, c.cb);
    });
    return this;
}

SVGElement.prototype.addClass = function (name: string) {
    let classes = this.getAttribute('class');
    if(classes) {
        if(classes.split(' ').indexOf(name) === -1) classes += ' ' + name;
    } else classes = name;
    this.setAttribute('class', classes);
    return this;
}

SVGElement.prototype.removeClass = function (name: string) {
    let classes = this.getAttribute('class') || '';
    classes = classes.split(' ').filter(c => c !== name).join(' ');
    this.setAttribute('class', classes);
    return this;
}


SVGElement.prototype.attr = function (name: string, value: string) {
    this.setAttribute(name, value);
    return this;
}

SVGElement.prototype.stroke = function (obj: { color?: string, width?: number, opacity?: number, dasharray?: string }) {
    if(obj.color !== undefined) this.setAttribute('stroke', obj.color);
    if(obj.width !== undefined) this.setAttribute('stroke-width', obj.width.toString());
    if(obj.opacity !== undefined) this.setAttribute('stroke-opacity', obj.opacity.toString());
    if(obj.dasharray !== undefined) this.setAttribute('stroke-dasharray', obj.dasharray);
    return this;
}

SVGElement.prototype.move = function (x: number, y: number) {
    this.setAttribute('cx', x.toString());
    this.setAttribute('cy', y.toString());
    return this;
}

SVGRectElement.prototype.move = function (x: number, y: number) {
    this.setAttribute('x', x.toString());
    this.setAttribute('y', y.toString());
    return this;
}

SVGTextElement.prototype.move = function (x: number, y: number) {
    this.setAttribute('x', x.toString());
    this.setAttribute('y', y.toString());
    return this;
}

SVGElement.prototype.fill = function (color: string) {
    this.setAttribute('fill', color);
    return this;
}

SVGElement.prototype.opacity = function (o: number) {
    this.setAttribute('opacity', o.toString());
    return this;
}

SVGRectElement.prototype.radius = function (r: number): SVGRectElement {
    this.setAttribute('rx', r.toString());
    this.setAttribute('ry', r.toString());
    return this;
}

SVGCircleElement.prototype.radius = function (r: number): SVGCircleElement {
    this.setAttribute('r', r.toString());
    return this;
}

SVGEllipseElement.prototype.radius = function (rx: number, ry: number) {
    this.setAttribute('rx', rx.toString());
    this.setAttribute('ry', ry.toString());
    return this;
}

function RoundElX(this: SVGElement,x?: number): any {
    if(x === undefined) return parseFloat(this.getAttribute('cx') || '0');
    this.setAttribute('cx', x.toString());
    return this;
}

function RoundElY(this: SVGElement, y?: number): any {
    if(y === undefined) return parseFloat(this.getAttribute('cy') || '0');
    this.setAttribute('cy', y.toString());
    return this;
}

function roundIncrement(this: SVGCircleElement | SVGEllipseElement, d: [x: number, y: number]) {
    this.x(this.x() + d[0]).y(this.y() + d[1]);
}

SVGPolylineElement.prototype.increment = function(d: [x: number, y: number]) {
    var points = this.array().map(c => [c[0] + d[0], c[1] + d[1]] as [number, number]);
    this.plot(points);
}

SVGPolylineElement.prototype.array = function() {
    return (this.getAttribute('points') || '')
    .split(' ')
    .filter(c => c.length)
    .map(z => 
        {
            var locs = z.split(',');
            return [parseFloat(locs[0]), parseFloat(locs[1])];
        }
    );
}

SVGPolylineElement.prototype.plot = function(points: [number, number][]) {
    this.setAttribute('points', points.reduce((str, point) => `${str} ${point[0]},${point[1]}`, ''));
}

SVGCircleElement.prototype.x = RoundElX;
SVGCircleElement.prototype.y = RoundElY;
SVGEllipseElement.prototype.x = RoundElX;
SVGEllipseElement.prototype.y = RoundElY;
SVGCircleElement.prototype.increment = roundIncrement;
SVGEllipseElement.prototype.increment = roundIncrement;

SVGTextElement.prototype.font = function (size: number, weight: string, fill?: string, anchor?: string): SVGTextElement {
    this.setAttribute('font-size', size.toString());
    this.setAttribute('font-weight', weight);
    if(fill) this.fill(fill);
    if(anchor) this.setAttribute('text-anchor', anchor);
    return this;
}