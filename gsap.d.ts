export {};

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
      /** Property-level array or value keyframes */
      [property: string]: unknown;
    }

    interface TweenVars {
      keyframes?: TweenVars[] | KeyframeVars;
    }
  }

  type GSAPKeyframeVars = gsap.KeyframeVars;
}
