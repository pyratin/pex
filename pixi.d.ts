import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /** Registered at runtime via `@pixi/react` useExtend */
      // @ts-expect-error -- missing dependencies
      pixiLayoutContainer: import('@pixi/react').PixiReactElementProps<
        typeof import('@pixi/layout/components').LayoutContainer
      > & {
        // @ts-expect-error -- missing dependencies
        layout?: Partial<import('@pixi/layout').LayoutStyles> | boolean;
        onLayout?: (layout: import('@pixi/layout').Layout) => void;
      };
      /** Registered at runtime via `@pixi/react` useExtend */
      pixiText: import('@pixi/react').PixiReactElementProps<
        typeof import('pixi.js').Text
      > &
        import('pixi.js').CanvasTextOptions;
      /** Registered at runtime via `@pixi/react` useExtend */
      pixiHTMLText: Omit<
        import('@pixi/react').PixiReactElementProps<
          typeof import('pixi.js').HTMLText
        > &
          import('pixi.js').HTMLTextOptions,
        'style'
      > & {
        style?: unknown;
      };
      /** Registered at runtime via `@pixi/react` useExtend */
      pixiBitmapText: import('@pixi/react').PixiReactElementProps<
        typeof import('pixi.js').BitmapText
      > &
        import('pixi.js').TextOptions;
    }
  }
}

declare module 'pixi-filters' {
  export interface DropShadowFilterOptions {
    antialias?: boolean;
  }
}

declare global {
  namespace gsap {
    interface KeyframeVars {
      /** Ease to use between each keyframe (v3.9+ percentage keyframes) */
      easeEach?: EaseString | EaseFunction;
      /** Overall ease across the entire keyframe animation */
      ease?: EaseString | EaseFunction;
      from?: TweenVars;
      to?: TweenVars;
      /** Percentage keyframe steps (e.g. '0%', '50%', '100%') */
      [percentage: `${number}%`]: TweenVars;
    }
  }

  type GSAPKeyframeVars = gsap.KeyframeVars;
}

