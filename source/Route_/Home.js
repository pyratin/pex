import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { LayoutContainer } from '@pixi/layout/components';

import useStore from '#/component/useStore';

const length = 16;

const dimension = 25;

const centerCoordinateGet = _.memoize((displayDimension) => {
  return Object.values(displayDimension).reduce(
    (memo, value, index) => ({
      ...memo,
      [!index ? 'x' : 'y']: (value - dimension) / 2
    }),
    {}
  );
});

/** @type {(index: number) => number} */
const rotationGet = (index) => ((Math.PI * 2) / length) * index;

/** @type {(index: number, displayDimension: object) => object} */
const positionGet = (index, displayDimension) => {
  const { x, y } = centerCoordinateGet(displayDimension);

  const rotation = rotationGet(index);

  return /** @type {{ x: number; y: number }} */ (
    Object.entries({ x, y }).reduce((memo, [key, value], index) => {
      const [operator] = !index ? ['cos'] : ['sin'];

      return {
        ...memo,
        [key]: value + Math[operator](rotation) * x
      };
    }, {})
  );
};

const LayoutContainer_ = ({ index }) => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        borderWidth: 0,
        borderColor: 0x00ff00,
        backgroundColor: 0x00ff00
      }}
      position={positionGet(index, displayDimension)}
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
      {Array.from({ length }).map((_, index) => (
        <LayoutContainer_ key={index} index={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
