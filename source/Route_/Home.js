import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const radius = 25;

const centerCoordinateGet = _.memoize(
  (displayDimension) => {
    return Object.values(displayDimension).reduce(
      (memo, value, index) => ({
        ...memo,
        [!index ? 'x' : 'y']: value / 2 - radius
      }),
      {}
    );
  },
  ({ width, height }) => `${width}-${height}`
);

const positionGet = (() => {
  let rotationX = 0;

  let rotationXDelta = 0.01;

  let rotationY = 0;

  let rotationYDelta = 0.02;

  /** @type {(displayDimension: object) => object} */
  return (displayDimension) => {
    rotationX += rotationXDelta;

    rotationY += rotationYDelta;

    const { x, y } = centerCoordinateGet(displayDimension);

    return Object.entries({ x, y }).reduce((memo, [key, value], index) => {
      const [operator, rotation, _value] = !index
        ? ['cos', rotationX, x]
        : ['sin', rotationY, y];

      return {
        ...memo,
        [key]: value + Math[operator](rotation) * _value
      };
    }, {});
  };
})();

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Graphics });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const fn = () => {
        Object.assign(
          ref.current,
          /** @type {pixiJs.ContainerOptions} */ ({
            position: positionGet(displayDimension)
          })
        );
      };

      gsap.ticker.add(fn);

      gsap.ticker.fps(60);

      return () => {
        gsap.ticker.remove(fn);
      };
    },
    { dependencies: [displayDimension], revertOnUpdate: true }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics.circle(0, 0, radius).fill({ color: 0x00ff00 })
        }
        layout={{}}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
