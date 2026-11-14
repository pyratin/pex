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

const Entity = () => {
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
          alpha: 0.25,
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
      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      gsap
        .timeline({
          repeat: -1,
          yoyo: true,
          repeatDelay: 1,
          delay: 2
        })
        .to(refCurrent.getChildAt(0), { pixi: { angle: -360 }, duration: 2 })
        .to(refCurrent.getChildAt(1), {
          pixi: { x: -100 },
          duration: 1,
          ease: 'elastic.out'
        })
        .to(refCurrent.getChildAt(2), {
          pixi: { x: 100, angle: 360 },
          duration: 2,
          ease: 'expo.out'
        });
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <Entity key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
