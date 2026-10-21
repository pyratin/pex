import { useRef, useEffect } from 'react';
import { World } from 'miniplex';
import random from 'random';
import niceColorPalettes from 'nice-color-palettes';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { useEntities } from 'miniplex-react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

/** @typedef {{ x: number; y: number }} vectorType */

/**
 * @typedef {{
 *   label: string;
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

const randomNormalizedGet = () => Math.max(0, Math.min(randomNormalGet(), 1));

/** @type {(displayDimension: object) => void} */
const worldInitialize = (displayDimension) => {
  world.clear();

  const centerCoordinate = centerCoordinateGet(displayDimension);

  const palette = random.choice(niceColorPalettes);

  Array.from({ length: 100 }).map((_, index) => {
    const age = Math.ceil(randomNormalizedGet() * (60 * 2) + 60);

    world.add({
      label: index.toString(),
      dimension: randomNormalGet() * 15 + 25,
      position: { ...centerCoordinate },
      velocity: (() => {
        const rotation = randomNormalGet() * (Math.PI * 2);

        const speed = randomNormalGet() * 5 + 2;

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

const LayoutContainer_ = ({ entity: { label, dimension, color } }) => {
  useExtend({ LayoutContainer, Graphics });

  const graphicsInitializedFlagRef = useRef(false);

  return (
    <pixiLayoutContainer
      label={label}
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        borderWidth: 0,
        borderColor: color
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          !graphicsInitializedFlagRef.current &&
          (() => {
            graphics
              .poly([dimension * 0.5, 0, dimension, dimension, 0, dimension])
              .fill({ color });

            Object.assign(graphicsInitializedFlagRef, { current: true });
          })()
        }
        layout={{}}
        rotation={Math.PI * 0.5}
      />
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

  const particleSystem = useEntities(world.with('label'));

  const ref = useRef(undefined);

  const worldInitializedFlagRef = useRef(undefined);

  useEffect(() => {
    !worldInitializedFlagRef.current &&
      (() => {
        worldInitialize(displayDimension);

        Object.assign(worldInitializedFlagRef, { current: true });
      })();
  }, [displayDimension]);

  useGSAP(
    () => {
      const fn = () => {
        particleSystem.entities.length
          ? particleSystem.entities.map((entity) => {
              const {
                label,
                position,
                velocity,
                acceleration,
                age,
                ageInitial
              } = entity;

              const _age = age - 1;

              const element = /** @type {pixiJs.Container} */ (
                ref.current
              ).getChildByLabel(label);

              _age
                ? element &&
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

                    const ageScale = _age / ageInitial;

                    Object.assign(
                      element,
                      /** @type {pixiJs.ContainerOptions} */ ({
                        position: _position,
                        scale: ageScale,
                        rotation: (() => {
                          const { x, y } = _velocity;

                          return Math.atan2(y, x);
                        })(),
                        alpha: ageScale
                      })
                    );
                  })()
                : world.remove(entity);
            })
          : worldInitialize(displayDimension);
      };

      gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [displayDimension], revertOnUpdate: true }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      {particleSystem.entities.map((entity) => (
        <LayoutContainer_ key={entity.label} entity={entity} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
