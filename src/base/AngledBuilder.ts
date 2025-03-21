import { AngledShape, IlElementExtra, Color } from "./types";
import { ShapeBuilder } from "./ShapeBuilder";

export class IlPolyline extends SVGPolylineElement implements IlElementExtra {
	categoriesPlain?: SVGTextElement;
	categoriesRect?: SVGRectElement;
	shape!: AngledShape;
	shadow!: SVGPolylineElement;
	discs!: SVGCircleElement[];
	hasConnector: boolean = false;
	editing: boolean = false;
}

export abstract class AngledBuilder<T extends AngledShape> extends ShapeBuilder<T> {
	element?: IlPolyline;
	canHB = true;
	abstract editShape_mm(event: MouseEvent): void;

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
		shape.points.push([...shape.points[0]]);
		this.processShape();
		shape.zoom(this.sd.ratio);
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
			_disc
				.fill(Color.GreenDisc)
				.radius(this.sd.discRadius)
				.addClass('seg-point')
				.click((e: MouseEvent) => { e.stopPropagation(); })
				.mousedown((e: MouseEvent) => {
					if (e.buttons === 1 && !e.ctrlKey && this.dragIndex === undefined) {
						this.dragIndex = index;
						[this.movePath!, ...this.rotateArr].forEach(item => item.remove());
						this.svg.mousemove((e: MouseEvent) => this.editShape_mm(e));
						e.stopPropagation();
					}
				});
			_disc.mouseup(() => this.editShape_mu());
		});
	}

	editShape_mu() {
		if (this.dragIndex !== undefined) {
			this.addMoveIcon();
			this.addRotateIcon();
			this.dragIndex = undefined;
			this.svg.off('mousemove');
			this.onEdited(this.shape!);
		}
	}

	processShape() { }
}
