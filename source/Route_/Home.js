import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import niceColorPalettes from 'nice-color-palettes';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const dimension = 100;

const palette = niceColorPalettes[0];

const Entity = ({ label }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      label={label}
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
          delay: 2,
          repeat: -1,
          yoyo: true,
          repeatDelay: 1
        })
        .to(refCurrent.getChildByLabel('0'), {
          pixi: { angle: -360 },
          duration: 2
        })
        .to(refCurrent.getChildByLabel('1'), {
          pixi: { x: -100 },
          duration: 1,
          ease: 'elastic.out'
        })
        .to(refCurrent.getChildByLabel('2'), {
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
        <Entity key={index} label={index.toString()} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
