import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const dimension = 50;

const centerCoordinateGet = _.memoize(
  (displayDimension) => {
    return Object.values(displayDimension).reduce((memo, value, index) => {
      const key = !index ? 'x' : 'y';

      return {
        ...memo,
        [key]: (value - dimension) * 0.5
      };
    }, {});
  },
  ({ width, height }) => `${width}-${height}`
);

/** @type {(frame: number, displayDimension: object) => object} */
const positionGet = (frame, displayDimension) => {
  const { x, y } = centerCoordinateGet(displayDimension);

  return Object.entries({ x, y }).reduce((memo, [key, value], index) => {
    const [operator, _value] = !index ? ['cos', 0.01] : ['sin', 0.02];

    return {
      ...memo,
      [key]: value + Math[operator](frame * _value) * value
    };
  }, {});
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  useGSAP(
    () => {
      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      /** @type {(_: number, __: number, frame: number) => void} */
      const fn = (_, __, frame) => {
        Object.assign(
          refCurrent,
          /** @type {pixiJs.ContainerOptions} */ ({
            position: positionGet(frame, displayDimension)
          })
        );
      };

      gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
    ></pixiLayoutContainer>
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
