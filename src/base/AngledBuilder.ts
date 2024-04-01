import { Polyline, Circle as Circ, Rect, Text } from "@svgdotjs/svg.js";
import { Director, ShapeBuilder } from "./base";
import { AngledShape, IlElementExtra, Color, ElementWithExtra } from "./types";
import Util from "./util";


export class IlPolyline extends Polyline implements IlElementExtra {
	classNames?: Text;
	classNamesWrapper?: Rect;
	shape!: AngledShape;
	shadow!: Polyline;
	discs!: Circ[];
	hasConnector: boolean = false;
	editing: boolean = false;
}

export abstract class AngledBuilder<T extends AngledShape> extends ShapeBuilder<T> {
	element?: IlPolyline;
	dragPointIndex?: number;
	abstract editShapeMouseMove(event: MouseEvent): void;

	newAngledShape(shape: T): void {
		this.element = Object.assign(this.svg.polyline([]), {
			shape,
			shadow: this.svg.polyline([]),
			discs: [],
			hasConnector: false,
			editing: false
		});
		this.element.fill(Color.ShapeFill)
		this.element.stroke({ color: Color.RedLine, width: 2, opacity: 0.7 });

		this.element.shadow.fill('none')
		this.element.shadow.stroke({ color: Color.BlackLine, width: 4, opacity: 0.4 });

		if (shape.points) {
			shape.points.forEach((point, index) => {
				if (index < shape.points.length - 1) {
					let circle = this.drawDisc(point[0], point[1], 2, Color.BlackDisc);
					this.element!.discs!.push(circle);
				}
			});
		}
	}

	editShape(): void {
		let polyline = this.element!;
		if (polyline.classNames) polyline.classNames.clear();
		if (polyline.classNamesWrapper) polyline.classNamesWrapper.remove();
		polyline.discs?.forEach((_disc, index) => {
			_disc.fill(Color.GreenDisc);
			_disc.size(10);
			_disc.addClass('seg-point');
			_disc.mousedown((event: MouseEvent) => {
				if (event.button === 0 && this.dragPointIndex === undefined) {
					this.dragPointIndex = index;
					this.moveIconPath!.remove();
					this.svg.mousemove((event: MouseEvent) => this.editShapeMouseMove(event));
				}
			});
			_disc.mouseup((event: MouseEvent) => {
				if (this.dragPointIndex !== undefined) {
					this.addMoveIcon();
					this.dragPointIndex = undefined;
					this.svg.off('mousemove');
				}
			})
		});
	}
	plotAngledShape(): void {
		if (this.element) this.plot(this.element);
	}

	plot(polyline: IlPolyline): void {
		polyline.shadow.plot(polyline.shape.points);
		polyline.plot(polyline.shape.points);
	}
}

export abstract class AngledDirector<T extends AngledShape> extends Director<T> {
	abstract builder: AngledBuilder<T>;

	zoomAngledShape(elem: IlPolyline, factor: number): void {
		elem.shape.points = elem.shape.points.map(p => [p[0] * factor, p[1] * factor]);
		this.builder.plot(elem as IlPolyline);
		elem.discs?.forEach(_disc => {
			_disc.cx(_disc.cx() * factor);
			_disc.cy(_disc.cy() * factor);
		});
		if (elem.shape.classes.length > 0) this.setOptions(elem, elem.shape.classes);
	}

	edit(shape: AngledShape): void {
		let polyline = this.builder.element = AngledDirector.elements.find(p => p.shape.id === shape.id)! as IlPolyline;
		ShapeBuilder.editing = true;
		polyline.editing = true;
		this.builder.initDrag();
		this.builder.editShape();
	}

	stopEdit(callOnEdited: boolean): void {
		if (ShapeBuilder.editing && this.builder.element && this.builder.element.editing) {
			ShapeBuilder.editing = this.builder.element.editing = false;
			this.builder.stopDrag();
			this.stopEditShape(this.builder.element);
			if (callOnEdited) Director.onAddedOrEdited?.(this.builder.element.shape);
		}
	}

	stopEditShape(polyline: IlPolyline): void {
		polyline.discs?.forEach((_disc, index) => {
			_disc.fill(Color.BlackDisc);
			_disc.size(4);
			_disc.removeClass('seg-point');
			this.builder.dragPointIndex = undefined;
			_disc.off('mousedown');
			_disc.off('mouseup')
		});
		let shape = polyline.shape;
		if (shape.classes.length > 0) this.setOptions(polyline, shape.classes);
	}

	innerPlot(shape: T): void {
		shape.points = shape.points.map(p => [p[0] * ShapeBuilder.ratio, p[1] * ShapeBuilder.ratio]);
		shape.points.push([...shape.points[0]]);
		this.builder.newAngledShape(shape);
		this.builder.plotAngledShape();
		this.addAngledShape(false);
		if (!this.builder.element) throw new Error();
		let classes = this.builder.element.shape.classes;
		if (classes.length > 0) this.setOptions(this.builder.element, classes);
	}

	addAngledShape(isNew: boolean = true) {
		if (!this.builder.element) return;
		if (this.builder.element.shape.id === 0) {
			this.builder.element.shape.id = ++Util.maxId;
		}
		let id = this.builder.element.shape.id;
		AngledDirector.elements.push(this.builder.element);
		if (isNew) Director.onAddedOrEdited?.(this.builder.element.shape);
		this.builder.element.node.addEventListener('contextmenu', ev => {
			if (ShapeBuilder.editing) return;
			ev.preventDefault();
			let elem = AngledDirector.elements.find(p => p.shape.id === id)!;
			elem.stroke({ color: Color.GreenLine });
			Director.onAddedOrEdited?.(elem.shape);
			return false;
		}, false);
		return id;
	}

	onDrawFinished() {

	}
}