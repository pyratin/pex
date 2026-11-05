import { useRef } from 'react';
import { useMemo } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import random from 'random';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin, Physics2DPlugin);
PixiPlugin.registerPIXI(pixiJs);

const ParticleEntity = ({ entity: { index, radius, position, color } }) => {
  useExtend({ Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        physics2D: {
          velocity: random.int(100, 300),
          angle: random.int(-80, -100),
          gravity: 100
        },
        pixi: { scale: 0.1, alpha: 0 },
        delay: index * -0.2,
        repeat: -1,
        duration: random.int(2, 6),
        ease: 'power1.out'
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiGraphics
      ref={ref}
      draw={(graphics) =>
        graphics.circle(0, 0, radius).stroke({ width: 2, color })
      }
      position={position}
    />
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const particleEntityCollection = useMemo(() => {
    return Array.from({ length: 160 }).map((_, index, collection) => {
      const indexNormalized = index / (collection.length - 1);

      return {
        index,
        radius: random.int(5, 40),
        position: (() => {
          const { width, height } = displayDimension;

          return { x: indexNormalized * width, y: height + 10 };
        })(),
        color: `hsl(${indexNormalized * 300}, 100%, 50%)`
      };
    });
  }, [displayDimension]);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      {particleEntityCollection.map((entity) => (
        <ParticleEntity key={entity.index} entity={entity} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
