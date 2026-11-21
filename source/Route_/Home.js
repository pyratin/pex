import { useMemo, useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import niceColorPalettes from 'nice-color-palettes';
import random from 'random';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin, Physics2DPlugin);
PixiPlugin.registerPIXI(pixiJs);

const timelineIdCollection = ['cannon', 'bulletCollection'];

const palette = niceColorPalettes[0];

const Cannon = ({ position, timelineRef }) => {
  useExtend({ Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const timelineRefCurrent = /** @type {GSAPTimeline} */ (
        timelineRef.current
      );

      const timeline = /** @type {GSAPTimeline} */ (
        timelineRefCurrent.getById(timelineIdCollection[0])
      );

      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      const angle = 20;

      timeline
        .to(refCurrent, {
          pixi: { angle: -angle },
          duration: 0.6,
          ease: 'power1.inOut'
        })
        .to(refCurrent, {
          pixi: { angle },
          duration: 0.6,
          ease: 'power1.inOut',
          repeat: 3,
          yoyo: true
        })
        .to(refCurrent, {
          pixi: { angle: 0 },
          duration: 0.6,
          ease: 'power1.inOut'
        });
    },
    { dependencies: [] }
  );

  return (
    <pixiGraphics
      ref={ref}
      draw={(graphics) =>
        graphics
          .roundPoly(0, 0, 50, 3, 10)
          .fill({ color: palette[3] })
          .stroke({ width: 4, color: 0xffffff })
      }
      position={position}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 10 },
          blur: 4,
          alpha: 0.25
        })
      ]}
    />
  );
};

const Bullet = () => {
  useExtend({ Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      gsap.set(refCurrent, {
        pixi: { scale: random.float(0.4, 0.6), alpha: 0 }
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiGraphics
      ref={ref}
      draw={(graphics) => graphics.circle(0, 0, 30).fill({ color: 0xffffff })}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 10 },
          blur: 4,
          alpha: 0.25
        })
      ]}
    />
  );
};

const BulletCollection = ({ position, timelineRef }) => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const timelineRefCurrent = /** @type {GSAPTimeline} */ (
        timelineRef.current
      );

      const timeline = /** @type {GSAPTimeline} */ (
        timelineRefCurrent.getById(timelineIdCollection[1])
      );

      const duration = /** @type {GSAPTimeline} */ (
        timelineRefCurrent.getById(timelineIdCollection[0])
      ).duration();

      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      const elementCollection = refCurrent.children.find(
        ({ children }) => children.length
      ).children;

      timeline
        .to(elementCollection, {
          pixi: { alpha: 1 },
          duration: 0.25,
          stagger: { amount: duration }
        })
        .to(
          elementCollection,
          {
            physics2D: {
              velocity: 'random(650, 800)',
              angle: () =>
                270 +
                Number(
                  gsap.getProperty(refCurrent.parent.getChildAt(0), 'angle')
                ),
              gravity: 600
            },
            duration,
            stagger: { amount: duration }
          },
          0
        );
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer ref={ref} position={position}>
      {Array.from({ length: 40 }).map((_, index) => (
        <Bullet key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const position = useMemo(() => {
    const { width, height } = displayDimension;

    return { x: width * 0.5, y: height - 100 };
  }, [displayDimension]);

  const timelineRef = useRef(
    (() => {
      const timeline = gsap.timeline();

      timelineIdCollection.map((id) => timeline.add(gsap.timeline({ id })));

      return timeline;
    })()
  );

  const onClickHandle = () =>
    /** @type {GSAPTimeline} */ (timelineRef.current).restart();

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
      eventMode='static'
      cursor='pointer'
      onClick={onClickHandle}
    >
      <Cannon position={position} timelineRef={timelineRef} />

      <BulletCollection position={position} timelineRef={timelineRef} />
    </pixiLayoutContainer>
  );
};

export default Home;
