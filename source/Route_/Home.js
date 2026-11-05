import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import niceColorPalettes from 'nice-color-palettes';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const dimension = 100;

const palette = niceColorPalettes[0];

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        width: dimension,
        height: dimension,
        borderWidth: 4,
        borderColor: 0xffffff,
        borderRadius: 8,
        backgroundColor: palette[3]
      }}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 5 },
          blur: 4,
          alpha: 0.5,
          antialias: true
        })
      ]}
    ></pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.to(
        /** @type {pixiJs.Container} */ (ref.current).children.find(
          ({ children }) => children.length
        ).children,
        {
          keyframes: /** @type {gsap.KeyframeVars} */ ({
            y: [0, 80, -10, 30, 0],
            ease: 'none',
            easeEach: 'power2.inOut'
          }),
          rotation: 180 * pixiJs.DEG_TO_RAD,
          duration: 5,
          stagger: 0.2,
          ease: 'elastic',
          repeat: -1,
          yoyo: true
        }
      );
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <LayoutContainer_ key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
