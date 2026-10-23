import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import { World } from 'miniplex';
import { useEntities } from 'miniplex-react';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import random from 'random';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import niceColorPalettes from 'nice-color-palettes';
import { DropShadowFilter } from 'pixi-filters';

gsap.registerPlugin(useGSAP, PixiPlugin, Physics2DPlugin);
PixiPlugin.registerPIXI(pixiJs);

/** @typedef {{ x: number; y: number }} vectorType */

/**
 * @typedef {{
 *   key: string;
 *   dimension: number;
 *   position: vectorType;
 * }} particleType
 */

/** @type {World<particleType>} */
const world = new World();

const palette = niceColorPalettes[0];

const LayoutContainer_ = ({ entity }) => {
  const { dimension, position } = entity;

  useExtend({ Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const refCurrent = /** @type {pixiJs.Graphics} */ (ref.current);

      gsap
        .timeline({
          onComplete: () => world.remove(entity)
        })
        .to(refCurrent, {
          pixi: { scale: random.float(0.3, 1) },
          duration: 0.02,
          ease: 'power3.out'
        })
        .to(refCurrent, {
          physics2D: {
            velocity: random.int(500, 1000),
            angle: random.int(0, 360),
            gravity: 1500
          },
          duration: 2,
          ease: 'none'
        });
    },
    { dependencies: [] }
  );

  return (
    <pixiGraphics
      ref={ref}
      draw={(graphics) =>
        graphics.circle(0, 0, dimension).fill({ color: 0xffffff })
      }
      position={position}
      scale={0}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 5 },
          blur: 4,
          alpha: 0.5
        })
      ]}
    />
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const particleSystem = useEntities(world.with('key'));

  const pointerTapCountRef = useRef(-1);

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerTapHandle = ({ client }) => {
    const pointerTapIndex = (() => {
      const { current } = pointerTapCountRef;

      const pointerTapIndex = current + 1;

      Object.assign(pointerTapCountRef, { current: pointerTapIndex });

      return pointerTapIndex;
    })();

    Array.from({ length: random.int(15, 30) }).map((_, index) => {
      const dimension = random.int(20, 40);

      world.add({
        key: `${pointerTapIndex}-${index}`,
        dimension,
        position: /** @type {{ x: number; y: number }} */ (
          Object.entries(client).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: value
            }),
            {}
          )
        )
      });
    });
  };

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
      eventMode='static'
      cursor='pointer'
      onPointerTap={onPointerTapHandle}
    >
      {particleSystem.entities.map((entity) => (
        <LayoutContainer_ key={entity.key} entity={entity} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
