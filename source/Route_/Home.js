import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { World } from 'miniplex';
import { useEntities } from 'miniplex-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { uid } from 'uid';
import random from 'random';
import niceColorPalettes from 'nice-color-palettes';

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
 * }} particleEntityType
 */

/** @type {World<particleEntityType>} */
const world = new World();

const ParticleEntity = ({ particleEntity }) => {
  const { dimension, position, color } = particleEntity;

  useExtend({ Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const fn = () => {
        const { position, velocity, acceleration, age, ageInitial } =
          particleEntity;

        const _age = age - 1;

        _age
          ? (() => {
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
                particleEntity,
                /** @type {particleEntityType} */ ({
                  position: _position,
                  velocity: _velocity,
                  age: _age
                })
              );

              const ageNormalized = _age / ageInitial;

              Object.assign(
                ref.current,
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
          : world.remove(particleEntity);
      };

      gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [] }
  );

  return (
    <pixiGraphics
      ref={ref}
      origin={{ x: dimension * 0.5, y: dimension }}
      draw={(graphics) =>
        graphics
          .clear()
          .poly([dimension * 0.5, 0, dimension, dimension, 0, dimension])
          .fill({ color })
      }
      position={position}
    />
  );
};

const randomNormalGet = random.normal();

const randomNormalClampedGet = () =>
  Math.max(0, Math.min(randomNormalGet(), 1));

/** @type {(dimension: number, displayDimension: object) => object} */
const positionGet = (dimension, displayDimension) =>
  Object.values(displayDimension).reduce((memo, value, index) => {
    const key = !index ? 'x' : 'y';

    return {
      ...memo,
      [key]: (value - dimension) * 0.5
    };
  }, {});

const velocityGet = () => {
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
};

/** @type {(displayDimension: object) => void} */
const particleGenerate = (displayDimension) => {
  world.clear();

  Array.from({ length: 100 }).map((_, index) => {
    const dimension = randomNormalClampedGet() * 25 + 25;

    const age = Math.ceil(randomNormalClampedGet() * (60 * 2) + 60 * 1);

    const palette = random.choice(niceColorPalettes);

    world.add({
      key: uid(),
      dimension,
      position: positionGet(dimension, displayDimension),
      velocity: velocityGet(),
      acceleration: { x: 0, y: 0.05 },
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

  const particleGenerateInitializedFlagRef = useRef(false);

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
      {particleSystem.entities.map((particleEntity) => (
        <ParticleEntity
          key={particleEntity.key}
          particleEntity={particleEntity}
        />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
