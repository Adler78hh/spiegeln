import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  chooseOriginalSide,
  dragHandle,
  hitTest,
  releaseHandle,
  sub,
  translateMirror,
  UNIT_RECT,
  type HandleId,
  type MirrorState,
  type Vec2,
} from '../geometry';
import { isTap, movedDistance, type PointerSample } from '../input/tap';
import { MirrorRenderer } from '../render/MirrorRenderer';

/** Radius der Touch-Fläche eines Anfasspunkts (CSS-Pixel), Durchmesser ≥ 48 px. */
const HANDLE_TOUCH_RADIUS = 34;
/** Toleranz für das Greifen der Linie (CSS-Pixel beidseitig). */
const LINE_TOUCH_TOLERANCE = 24;
/** Rand um die Arbeitsfläche, damit die Anfasspunkte ganz sichtbar sind. */
const PAD = 30;

export interface MirrorCanvasProps {
  image: CanvasImageSource | null;
  imageSize: { width: number; height: number };
  /** Zustand des Spiegels; Änderungen von außen werden übernommen. */
  mirror: MirrorState;
  /** Wird am Ende jeder Geste mit dem neuen Zustand aufgerufen. */
  onMirrorChange: (m: MirrorState) => void;
  rotation: number;
  snap: boolean;
}

type Gesture =
  | { kind: 'handle'; pointerId: number; which: HandleId }
  | { kind: 'line'; pointerId: number; start: MirrorState; startPt: Vec2 }
  | { kind: 'area'; pointerId: number; down: PointerSample; maxMove: number };

export function MirrorCanvas(props: MirrorCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MirrorRenderer | null>(null);
  const mirrorRef = useRef(props.mirror);
  const gestureRef = useRef<Gesture | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const frameRef = useRef(0);

  const requestDraw = () => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const g = gestureRef.current;
      rendererRef.current?.draw({
        mirror: mirrorRef.current,
        rotation: propsRef.current.rotation,
        active: g?.kind === 'handle' ? g.which : g?.kind === 'line' ? 'line' : null,
      });
    });
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const renderer = new MirrorRenderer(canvas);
    rendererRef.current = renderer;
    const ro = new ResizeObserver(() => {
      const size = Math.floor(Math.min(wrap.clientWidth, wrap.clientHeight));
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      renderer.resize(size, PAD, window.devicePixelRatio || 1);
      requestDraw();
    });
    ro.observe(wrap);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setImage(props.image, props.imageSize.width, props.imageSize.height);
    requestDraw();
  }, [props.image, props.imageSize.width, props.imageSize.height]);

  useEffect(() => {
    if (!gestureRef.current) mirrorRef.current = props.mirror;
    requestDraw();
  }, [props.mirror, props.rotation]);

  const local = (e: React.PointerEvent): { css: Vec2; norm: Vec2 } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const css = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return { css, norm: rendererRef.current!.toNormalized(css.x, css.y) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (gestureRef.current) return; // weitere Finger vorerst ignorieren
    const renderer = rendererRef.current;
    if (!renderer) return;
    const { css, norm } = local(e);
    const area = renderer.layout.area;
    const hit = hitTest(mirrorRef.current, norm, HANDLE_TOUCH_RADIUS / area, LINE_TOUCH_TOLERANCE / area);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (hit === 'a' || hit === 'b') {
      gestureRef.current = { kind: 'handle', pointerId: e.pointerId, which: hit };
    } else if (hit === 'line') {
      gestureRef.current = { kind: 'line', pointerId: e.pointerId, start: mirrorRef.current, startPt: norm };
    } else {
      gestureRef.current = { kind: 'area', pointerId: e.pointerId, down: { ...css, t: e.timeStamp }, maxMove: 0 };
    }
    requestDraw();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const { css, norm } = local(e);
    if (g.kind === 'handle') {
      mirrorRef.current = dragHandle(mirrorRef.current, g.which, norm, UNIT_RECT, { snap: propsRef.current.snap });
    } else if (g.kind === 'line') {
      mirrorRef.current = translateMirror(g.start, sub(norm, g.startPt), UNIT_RECT);
    } else {
      g.maxMove = Math.max(g.maxMove, movedDistance(g.down, css));
      return;
    }
    requestDraw();
  };

  const finish = (e: React.PointerEvent, cancelled: boolean) => {
    const g = gestureRef.current;
    if (!g || g.pointerId !== e.pointerId) return;
    gestureRef.current = null;
    const { css, norm } = local(e);
    if (g.kind === 'handle') {
      mirrorRef.current = releaseHandle(mirrorRef.current, g.which, UNIT_RECT);
    } else if (g.kind === 'area' && !cancelled && isTap(g.down, { ...css, t: e.timeStamp }, g.maxMove)) {
      if (norm.x >= 0 && norm.x <= 1 && norm.y >= 0 && norm.y <= 1) {
        mirrorRef.current = chooseOriginalSide(mirrorRef.current, norm);
      }
    }
    requestDraw();
    if (mirrorRef.current !== propsRef.current.mirror) propsRef.current.onMirrorChange(mirrorRef.current);
  };

  return (
    <div ref={wrapRef} className="mirror-wrap">
      <canvas
        ref={canvasRef}
        className="mirror-canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finish(e, false)}
        onPointerCancel={(e) => finish(e, true)}
      />
    </div>
  );
}
