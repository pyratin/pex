import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import { World } from 'miniplex';
import { useEntities } from 'miniplex-react';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { uid } from 'uid';
import random from 'random';
import niceColorPalettes from 'nice-color-palettes';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

/** @typedef {{ x: number; y: number }} vectorType */

/**
 * @typedef {{
 *   key: string;
 *   dimension: number;
 *   position: vectorType;
 *   velocity: vectorType;
 *   acceleration: vectorType;
 *   age: number;
 *   ageInitial: number;
 *   color: string;
 * }} particleType
 */

/** @type {World<particleType>} */
const world = new World();

const ParticleEntity = ({ entity }) => {
  const { dimension, color } = entity;

  useExtend({ Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const fn = () => {
        const { position, velocity, acceleration, age, ageInitial } = entity;

        const _age = age - 1;

        const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

        _age
          ? refCurrent &&
            (() => {
              const _velocity = (() => {
                const { x, y } = velocity;

                const { x: _x, y: _y } = acceleration;

                return { x: x + _x, y: y + _y };
              })();

              const _position = (() => {
                const { x, y } = position;

                const { x: _x, y: _y } = _velocity;

                return { x: x + _x, y: y + _y };
              })();

              Object.assign(
                entity,
                /** @type {particleType} */ ({
                  position: _position,
                  velocity: _velocity,
                  age: _age
                })
              );

              const ageNormalized = _age / ageInitial;

              Object.assign(
                refCurrent,
                /** @type {pixiJs.ContainerOptions} */ ({
                  position: _position,
                  rotation: (() => {
                    const { x, y } = _velocity;

                    return Math.atan2(y, x) + Math.PI * 0.5;
                  })(),
                  scale: ageNormalized,
                  alpha: ageNormalized
                })
              );
            })()
          : (() => {
              world.remove(entity);

              gsap.ticker.remove(fn);
            })();
      };

      gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [] }
  );

  return (
    <pixiGraphics
      ref={ref}
      draw={(graphics) =>
        graphics
          .clear()
          .poly([dimension * 0.5, 0, dimension, dimension, 0, dimension])
          .fill({ color })
      }
      origin={{ x: dimension * 0.5, y: dimension }}
    />
  );
};

/** @type {(displayDimension: object) => object} */
const centerCoordinateGet = (displayDimension) =>
  Object.values(displayDimension).reduce((memo, value, index) => {
    const key = !index ? 'x' : 'y';

    return {
      ...memo,
      [key]: value * 0.5
    };
  }, {});

const randomNormalGet = random.normal();

const randomNormalClampedGet = () =>
  Math.max(0, Math.min(randomNormalGet(), 1));

/** @type {(displayDimension: object) => void} */
const particleGenerate = (displayDimension) => {
  world.clear();

  const centerCoordinate = centerCoordinateGet(displayDimension);

  const palette = random.choice(niceColorPalettes);

  Array.from({ length: 100 }).map((_, index) => {
    const age = Math.ceil(randomNormalClampedGet() * (60 * 2) + 60 * 2);

    world.add({
      key: uid(),
      dimension: randomNormalClampedGet() * 25 + 25,
      position: { ...centerCoordinate },
      velocity: (() => {
        const rotation = randomNormalGet() * (Math.PI * 2);

        const speed = randomNormalGet() * 5 + 5;

        return /** @type {{ x: number; y: number }} */ (
          ['x', 'y'].reduce((memo, key, index) => {
            const operator = !index ? 'cos' : 'sin';

            return {
              ...memo,
              [key]: Math[operator](rotation) * speed
            };
          }, {})
        );
      })(),
      acceleration: { x: 0, y: 0.025 },
      age,
      ageInitial: age,
      color: palette[index % palette.length]
    });
  });
};

const Home = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const particleSystem = useEntities(world.with('key'));

  const particleGenerateInitializedFlagRef = useRef(undefined);

  useEffect(() => {
    !particleGenerateInitializedFlagRef.current &&
      (() => {
        particleGenerate(displayDimension);

        Object.assign(particleGenerateInitializedFlagRef, { current: true });
      })();
  }, [displayDimension]);

  useEffect(() => {
    const unsubscribe = particleSystem.onEntityRemoved.subscribe(() =>
      queueMicrotask(
        () =>
          !particleSystem.entities.length && particleGenerate(displayDimension)
      )
    );

    return () => unsubscribe();
  }, [displayDimension, particleSystem]);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      {particleSystem.entities.map((entity) => (
        <ParticleEntity key={entity.key} entity={entity} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
