import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { World } from 'miniplex';
import { LayoutContainer } from '@pixi/layout/components';
import { useEntities } from 'miniplex-react';
import * as pixiJs from 'pixi.js';
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
 *   position: vectorType;
 *   velocity: vectorType;
 *   acceleration: vectorType;
 *   age: number;
 * }} particleType
 */

const centerCoordinateGet = _.memoize((displayDimension) => {
  return /** @type {vectorType} */ (
    Object.values(displayDimension).reduce(
      (memo, value, index) => ({
        ...memo,
        [!index ? 'x' : 'y']: value / 2
      }),
      {}
    )
  );
});

/** @type {World<particleType>} */
const world = new World();

/** @type {(displayDimension: object) => void} */
const worldInitialize = (displayDimension) => {
  Array.from({ length: 100 }).map((_, index) => {
    const rotation = Math.random() * (Math.PI * 2);

    const speed = Math.random() * 4 + 2;

    world.add({
      label: index.toString(),
      position: { ...centerCoordinateGet(displayDimension) },
      velocity: Array.from({ length: 2 }).reduce((memo, _, index) => {
        const [key, operator] = !index ? ['x', 'cos'] : ['y', 'sin'];

        return {
          ...memo,
          [key]: Math[operator](rotation) * speed
        };
      }, {}),
      acceleration: { x: 0, y: 0.025 },
      age: Math.ceil(Math.random() * (60 * 3) + 60)
    });
  });
};

const LayoutContainer_ = ({ label }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      label={label}
      layout={{
        position: 'absolute',
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
    ></pixiLayoutContainer>
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

  useEffect(() => {
    world.clear();

    worldInitialize(displayDimension);
  }, [displayDimension]);

  useGSAP(
    () => {
      const fn = () => {
        particleSystem.entities.map((entity) => {
          const { label, position, velocity, acceleration, age } = entity;

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

                const rotation = (() => {
                  const { rotation } = element;

                  return (rotation || Math.random() * (Math.PI * 2)) + 0.025;
                })();

                Object.assign(
                  entity,
                  /** @type {particleType} */ ({
                    position: _position,
                    velocity: _velocity,
                    age: _age
                  })
                );

                Object.assign(
                  element,
                  /** @type {pixiJs.ContainerOptions} */ ({
                    position: _position,
                    scale: age * 0.01,
                    rotation
                  })
                );
              })()
            : world.remove(entity);
        });
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
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      {particleSystem.entities.map(({ label }) => (
        <LayoutContainer_ key={label} label={label} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
