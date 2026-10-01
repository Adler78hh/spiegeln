import { useEffect, useLayoutEffect, useRef } from 'react';
import {
  chooseOriginalSide,
  dragHandle,
  hitTest,
  moveFigure,
  pinchFigure,
  releaseHandle,
  sub,
  translateMirror,
  UNIT_RECT,
  type FigureState,
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

export interface Scene {
  mirror: MirrorState;
  figure: FigureState;
}

export interface MirrorCanvasProps {
  image: CanvasImageSource | null;
  imageSize: { width: number; height: number };
  /** Spiegel und Figur; Änderungen von außen werden übernommen. */
  scene: Scene;
  /** Wird am Ende jeder Geste mit dem neuen Zustand aufgerufen. */
  onSceneChange: (s: Scene) => void;
  snap: boolean;
  /** Blasser Umriss, wenn die Figur fast ganz verschwunden ist. */
  showOutline: boolean;
}

type Gesture =
  | { kind: 'handle'; pointerId: number; which: HandleId }
  | { kind: 'line'; pointerId: number; start: MirrorState; startPt: Vec2 }
  | {
      kind: 'figure';
      pointerId: number;
      down: PointerSample;
      maxMove: number;
      start: FigureState;
      startPt: Vec2;
    }
  | {
      kind: 'pinch';
      ids: [number, number];
      start: FigureState;
      startPts: [Vec2, Vec2];
      pts: Map<number, Vec2>;
    };

export function MirrorCanvas(props: MirrorCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MirrorRenderer | null>(null);
  const sceneRef = useRef(props.scene);
  const gestureRef = useRef<Gesture | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;
  const frameRef = useRef(0);
  /** Letzte Position des ersten Fingers (für den Übergang zur Zwei-Finger-Geste). */
  const lastPoint = useRef<Vec2 | null>(null);

  const requestDraw = () => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const g = gestureRef.current;
      rendererRef.current?.draw({
        ...sceneRef.current,
        active: g?.kind === 'handle' ? g.which : g?.kind === 'line' ? 'line' : null,
        showOutline: propsRef.current.showOutline,
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
    if (!gestureRef.current) sceneRef.current = props.scene;
    requestDraw();
  }, [props.scene, props.showOutline]);

  const local = (e: React.PointerEvent): { css: Vec2; norm: Vec2 } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const css = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return { css, norm: rendererRef.current!.toNormalized(css.x, css.y) };
  };

  const setMirror = (mirror: MirrorState) => {
    sceneRef.current = { ...sceneRef.current, mirror };
  };
  const setFigure = (figure: FigureState) => {
    sceneRef.current = { ...sceneRef.current, figure };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const { css, norm } = local(e);
    const g = gestureRef.current;

    if (g) {
      // Zweiter Finger während des Verschiebens der Figur → Drehen mit zwei Fingern.
      if (g.kind === 'figure') {
        e.currentTarget.setPointerCapture(e.pointerId);
        const firstNow = lastPoint.current ?? g.startPt;
        const pts = new Map<number, Vec2>([
          [g.pointerId, firstNow],
          [e.pointerId, norm],
        ]);
        gestureRef.current = {
          kind: 'pinch',
          ids: [g.pointerId, e.pointerId],
          start: sceneRef.current.figure,
          startPts: [firstNow, norm],
          pts,
        };
      }
      return; // Weitere Finger werden ignoriert.
    }

    const area = renderer.layout.area;
    const hit = hitTest(sceneRef.current.mirror, norm, HANDLE_TOUCH_RADIUS / area, LINE_TOUCH_TOLERANCE / area);
    e.currentTarget.setPointerCapture(e.pointerId);
    if (hit === 'a' || hit === 'b') {
      gestureRef.current = { kind: 'handle', pointerId: e.pointerId, which: hit };
    } else if (hit === 'line') {
      gestureRef.current = { kind: 'line', pointerId: e.pointerId, start: sceneRef.current.mirror, startPt: norm };
    } else {
      lastPoint.current = norm;
      gestureRef.current = {
        kind: 'figure',
        pointerId: e.pointerId,
        down: { ...css, t: e.timeStamp },
        maxMove: 0,
        start: sceneRef.current.figure,
        startPt: norm,
      };
    }
    requestDraw();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gestureRef.current;
    if (!g) return;
    const { css, norm } = local(e);
    if (g.kind === 'pinch') {
      if (!g.pts.has(e.pointerId)) return;
      g.pts.set(e.pointerId, norm);
      const [a, b] = g.ids.map((id) => g.pts.get(id)!);
      setFigure(pinchFigure(g.start, g.startPts[0], g.startPts[1], a, b, UNIT_RECT));
      requestDraw();
      return;
    }
    if (g.pointerId !== e.pointerId) return;
    if (g.kind === 'handle') {
      setMirror(dragHandle(sceneRef.current.mirror, g.which, norm, UNIT_RECT, { snap: propsRef.current.snap }));
    } else if (g.kind === 'line') {
      setMirror(translateMirror(g.start, sub(norm, g.startPt), UNIT_RECT));
    } else {
      lastPoint.current = norm;
      g.maxMove = Math.max(g.maxMove, movedDistance(g.down, css));
      // Erst ab einer kleinen Bewegung verschieben, damit Tippen die Figur nicht verrückt.
      if (!isTap(g.down, { ...css, t: g.down.t }, g.maxMove)) {
        setFigure(moveFigure(g.start, sub(norm, g.startPt), UNIT_RECT));
      }
    }
    requestDraw();
  };

  const commit = () => {
    requestDraw();
    if (sceneRef.current !== propsRef.current.scene) propsRef.current.onSceneChange(sceneRef.current);
  };

  const finish = (e: React.PointerEvent, cancelled: boolean) => {
    const g = gestureRef.current;
    if (!g) return;
    const { css, norm } = local(e);

    if (g.kind === 'pinch') {
      if (!g.pts.has(e.pointerId)) return;
      // Ein Finger bleibt liegen → mit ihm weiter verschieben (ohne Tippen).
      const restId = g.ids.find((id) => id !== e.pointerId)!;
      const restPt = g.pts.get(restId)!;
      lastPoint.current = restPt;
      gestureRef.current = {
        kind: 'figure',
        pointerId: restId,
        down: { x: -1e6, y: -1e6, t: -1e6 }, // kein Tippen mehr möglich
        maxMove: Infinity,
        start: sceneRef.current.figure,
        startPt: restPt,
      };
      commit();
      return;
    }

    if (g.pointerId !== e.pointerId) return;
    gestureRef.current = null;
    if (g.kind === 'handle') {
      setMirror(releaseHandle(sceneRef.current.mirror, g.which, UNIT_RECT));
    } else if (g.kind === 'figure' && !cancelled && isTap(g.down, { ...css, t: e.timeStamp }, g.maxMove)) {
      if (norm.x >= 0 && norm.x <= 1 && norm.y >= 0 && norm.y <= 1) {
        setMirror(chooseOriginalSide(sceneRef.current.mirror, norm));
      }
    }
    commit();
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
