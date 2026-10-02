import { useRef, useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useExtend } from '@pixi/react';
import { World } from 'miniplex';
import { useEntities } from 'miniplex-react';
import _ from 'lodash';
import random from 'random';
import niceColorPalettes from 'nice-color-palettes';
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

const centerCoordinateGet = _.memoize(
  (displayDimension) =>
    Object.values(displayDimension).reduce((memo, value, index) => {
      const key = !index ? 'x' : 'y';

      return {
        ...memo,
        [key]: value * 0.5
      };
    }, {}),
  (object) => Object.values(object).join('-')
);

const randomNormalGet = random.normal();

const randomNormalizedGet = () => Math.max(0, Math.min(randomNormalGet(), 1));

const paletteGet = () => {
  return random.choice(niceColorPalettes);
};

/** @type {(displayDimension: object) => void} */
const worldInitialize = (displayDimension) => {
  world.clear();

  const centerCoordinate = centerCoordinateGet(displayDimension);

  const age = Math.ceil(randomNormalizedGet() * (60 * 2) + 60 * 2);

  const palette = paletteGet();

  Array.from({ length: 100 }).map((_, index) => {
    world.add({
      label: index.toString(),
      dimension: randomNormalGet() * 25 + 25,
      position: { ...centerCoordinate },
      velocity: (() => {
        const rotation = randomNormalGet() * (Math.PI * 2);

        const speed = randomNormalGet() * 4 + 2;

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

const LayoutContainer_ = ({ entity }) => {
  const { label, dimension, color } = entity;

  useExtend({ LayoutContainer, Graphics });

  const draw = useCallback(
    /** @type {(graphics: pixiJs.Graphics) => void} */
    (graphics) => {
      graphics
        .poly([dimension * 0.5, 0, dimension, dimension, 0, dimension])
        .fill({ color });
    },
    [dimension, color]
  );

  return (
    <pixiLayoutContainer
      label={label}
      layout={{
        position: 'absolute',
        transformOrigin: 'bottom'
      }}
    >
      <pixiGraphics draw={draw} layout={{}} />
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

  const worldInitializedFlagRef = useRef(false);

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

                    const rotation = (() => {
                      const { x, y } = _velocity;

                      return Math.atan2(y, x) + Math.PI * 0.5;
                    })();

                    const ageScale = _age / ageInitial;

                    Object.assign(
                      element,
                      /** @type {pixiJs.ContainerOptions} */ ({
                        position: _position,
                        scale: ageScale,
                        rotation
                      })
                    );

                    Object.assign(
                      element.getChildAt(0),
                      /** @type {pixiJs.ContainerOptions} */ ({
                        alpha: ageScale
                      })
                    );
                  })()
                : world.remove(entity);
            })
          : worldInitialize(displayDimension);
      };

      gsap.ticker.add(fn);

      gsap.ticker.fps(60);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [displayDimension], revertOnUpdate: true }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
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
