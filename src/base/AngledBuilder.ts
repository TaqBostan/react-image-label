import { Polyline, Circle as Circ, Rect, Text } from "@svgdotjs/svg.js";
import { AngledShape, IlElementExtra, Color, ElementWithExtra } from "./types";
import { ShapeBuilder } from "./ShapeBuilder";

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
	abstract editShapeMouseMove(event: MouseEvent): void;

	createElement(shape: AngledShape): void {
		this.element = Object.assign(this.svg.polyline([]), {
			shape, shadow: this.svg.polyline([]), discs: [], hasConnector: false, editing: false
		});
		this.element.fill(Color.ShapeFill)
		this.element.stroke({ color: Color.RedLine, width: 2, opacity: 0.7 });

		this.element.shadow.fill('none')
		this.element.shadow.stroke({ color: Color.BlackLine, width: 4, opacity: 0.4 });

		if (shape.points) {
			shape.points.forEach((point, index) => {
				if (index < shape!.points.length - 1) {
					let circle = this.drawDisc(point[0], point[1], 2, Color.BlackDisc);
					this.element!.discs!.push(circle);
				}
			});
		}
	}

	plotShape(): void {
		let shape = this.shape!;
		this.processShape();
		shape.points = shape.points.map(p => [p[0] * ShapeBuilder.ratio, p[1] * ShapeBuilder.ratio]);
		shape.points.push([...shape.points[0]]);
		this.createElement(shape);
		this.plotAngledShape();
	}

	plotAngledShape(): void {
		if (this.element) this.plot(this.element);
	}

	plot(polyline: IlPolyline): void {
		polyline.shadow.plot(polyline.shape.points);
		polyline.plot(polyline.shape.points);
	}

	editShape(): void {
		let polyline = this.element!;
		polyline.discs?.forEach((_disc, index) => {
			_disc.fill(Color.GreenDisc);
			_disc.size(10);
			_disc.addClass('seg-point');
			_disc.click((event: MouseEvent) => { event.stopPropagation();});
			_disc.mousedown((event: MouseEvent) => {
				if (event.button === 0 && this.dragPointIndex === undefined) {
					this.dragPointIndex = index;
					this.moveIconPath!.remove();
					this.svg.mousemove((event: MouseEvent) => this.editShapeMouseMove(event));
					event.stopPropagation();
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

	processShape() { }
}
