const ns = "http://www.w3.org/2000/svg";
export class SVGEl {
    constructor(public node: SVGElement, private events: {event: string, cb: EventListener}[] = []) {
    }
    append = (el: SVGEl) => this.node.append(el.node);
    fill(color: string) {
        this.attr('fill', color);
        return this;
    }
    move(x: number, y: number){
        this.attr('cx', x.toString());
        this.attr('cy', y.toString());
        return this;
    }
    addClass(name: string) {
        let classes = this.getAttr('class');
        if(classes) {
            if(classes.split(' ').indexOf(name) === -1) classes += ' ' + name;
        } else classes = name;
        this.attr('class', classes);
        return this;
    }
    removeClass(name: string) {
        let classes = this.getAttr('class') || '';
        classes = classes.split(' ').filter(c => c !== name).join(' ');
        this.attr('class', classes);
        return this;
    }
    stroke(obj: { color?: string, width?: number, opacity?: number, dasharray?: string }){
        if(obj.color !== undefined) this.attr('stroke', obj.color);
        if(obj.width !== undefined) this.attr('stroke-width', obj.width.toString());
        if(obj.opacity !== undefined) this.attr('stroke-opacity', obj.opacity.toString());
        if(obj.dasharray !== undefined) this.attr('stroke-dasharray', obj.dasharray);
        return this;
    }
    getAttr = (name: string) => this.node.getAttribute(name)
    attr(name: string, value: string) {
        this.node.setAttribute(name, value);
        return this;
    }
    register(event: string, cb: EventListener) {
        this.events = this.events || [];
        this.events.push({event, cb: cb});
    }
    mouseup(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('mouseup', cb);
        this.register('mouseup', cb as EventListener);
        return this;
    }

    mousedown(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('mousedown', cb);
        this.register('mousedown', cb as EventListener);
        return this;
    }

    mousemove(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('mousemove', cb);
        this.register('mousemove', cb as EventListener);
        return this;
    }

    mouseover(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('mouseover', cb);
        this.register('mouseover', cb as EventListener);
        return this;
    }

    mouseout(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('mouseout', cb);
        this.register('mouseout', cb as EventListener);
        return this;
    }

    click(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('click', cb);
        this.register('click', cb as EventListener);
        return this;
    }

    dblclick(cb: (ev: MouseEvent) => any) {
        this.node.addEventListener('dblclick', cb);
        this.register('dblclick', cb as EventListener);
        return this;
    }
    on(event: string, cb: (ev: any) => any) {
        this.node.addEventListener(event, cb);
        this.register(event, cb as EventListener);
        return this;
    }
    off(event: string){
        this.events = this.events || [];
        this.events.filter(c => c.event === event).forEach(c => {
            this.node.removeEventListener(c.event, c.cb);
        });
        return this;
    }
    opacity(o: number){
        this.attr('opacity', o.toString());
        return this;
    }
    remove = () => this.node.remove()

    increment(d: [x: number, y: number]) {
        throw new Error('not implemented');
    }
    after = (el: SVGEl) => this.node.after(el.node)
    before = (el: SVGEl) => this.node.before(el.node)
}



export class CircleEl extends SVGEl {
    constructor(public node: SVGCircleElement) {
        super(node);
    }
    increment = roundIncrement
    x = RoundElX;
    y = RoundElY;
    radius(r: number){
        this.attr('r', r.toString());
        return this;
    }
}

export class EllipseEl extends SVGEl {
    constructor(public node: SVGEllipseElement) {
        super(node);
    }
    increment = roundIncrement
    x = RoundElX
    y = RoundElY
    radius(rx: number, ry: number) {
        this.attr('rx', rx.toString());
        this.attr('ry', ry.toString());
        return this;
    }
}

export class RectEl extends SVGEl {
    constructor(public node: SVGRectElement) {
        super(node);
    }
    radius(r: number){
        this.attr('rx', r.toString());
        this.attr('ry', r.toString());
        return this;
    }
    move(x: number, y: number) {
        this.attr('x', x.toString());
        this.attr('y', y.toString());
        return this;
    }
}

export class PolylineEl extends SVGEl {
    constructor(public node: SVGPolylineElement) {
        super(node);
    }

    array(){
        return (this.getAttr('points') || '')
        .split(' ')
        .filter(c => c.length)
        .map(z => 
            {
                var locs = z.split(',');
                return [parseFloat(locs[0]), parseFloat(locs[1])];
            }
        );
    }

    plot(points: [number, number][]){
        this.attr('points', points.reduce((str, point) => `${str} ${point[0]},${point[1]}`, '').trimStart());
    }
    increment(d: [x: number, y: number]) {
        var points = this.array().map(c => [c[0] + d[0], c[1] + d[1]] as [number, number]);
        this.plot(points);
    }
}

export class TextEl extends SVGEl {
    constructor(public node: SVGTextElement) {
        super(node);
    }
    font(size: number, weight: string, fill?: string, anchor?: string){
        this.attr('font-size', size.toString());
        this.attr('font-weight', weight);
        if(fill) this.fill(fill);
        if(anchor) this.attr('text-anchor', anchor);
        return this;
    }
    move(x: number, y: number) {
        this.attr('x', x.toString());
        this.attr('y', y.toString());
        return this;
    }
    bbox = () => this.node.getBBox()
}

export class PathEl extends SVGEl {
    constructor(public node: SVGPathElement) {
        super(node);
    }
    plot(d: string) {
        this.attr('d', d);
        return this;
    }
}

export class  ImageEl extends SVGEl {
    constructor(public node: SVGImageElement) {
        super(node);
    }
    size(w: string, h: string){ size(this, w, h); return this; };
    bbox = () => this.node.getBBox()
}

export class SVGSVGEl extends SVGEl {
    constructor(public node: SVGSVGElement) {
        super(node);
    }

    circle(r: number) {
        let c = new CircleEl(document.createElementNS(ns, 'circle'));
        c.attr('r', r.toString());
        this.append(c);
        return c;
    }

    ellipse(rx: number, ry: number) {
        let c = new EllipseEl(document.createElementNS(ns, 'ellipse'));
        c.attr('rx', rx.toString());
        c.attr('ry', ry.toString());
        this.append(c);
        return c;
    }

    rect(w: number, h: number) {
        let r = new RectEl(document.createElementNS(ns, 'rect'));
        r.attr('height', h.toString());
        r.attr('width', w.toString());
        this.append(r);
        return r;
    }

    polyline(points: [number, number][]) {
        let c = new PolylineEl(document.createElementNS(ns, 'polyline'));
        c.plot(points);
        this.append(c);
        return c;
    }

    plain(text: string) {
        let r = new TextEl(document.createElementNS(ns, 'text'));
        r.node.innerHTML = text;
        this.append(r);
        return r;
    }

    path(d: string){
        let p = new PathEl(document.createElementNS(ns, 'path'));
        p.plot(d);
        this.append(p);
        return p;
    }

    image(url: string, onload: (target: ImageEl) => any){
        let c = new ImageEl(document.createElementNS(ns, 'image'));
        c.attr('href', url);
        this.append(c);
        c.node.addEventListener("load", (ev: Event) => {
            if (!ev?.currentTarget || !this.node.innerHTML) return;
            onload(new ImageEl(ev.currentTarget as SVGImageElement));
        });
        return c;
    }

    size(w: number, h: number) { size(this, w.toString(), h.toString()); }
}

function size(el: SVGEl, w: string, h: string) {
    if(w) el.attr('width', w);
    else el.node.removeAttribute('width');
    if(h) el.attr('height', h);
    else el.node.removeAttribute('height');
}

function RoundElX(this: SVGEl,x?: number): any {
    if(x === undefined) return parseFloat(this.getAttr('cx') || '0');
    this.attr('cx', x.toString());
    return this;
}

function RoundElY(this: SVGEl, y?: number): any {
    if(y === undefined) return parseFloat(this.getAttr('cy') || '0');
    this.attr('cy', y.toString());
    return this;
}

function roundIncrement(this: CircleEl | EllipseEl, d: [x: number, y: number]) {
    this.x(this.x() + d[0]).y(this.y() + d[1]);
}