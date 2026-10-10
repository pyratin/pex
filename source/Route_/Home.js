import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';

import useStore from '#/component/useStore';

const length = 124;

const dimension = 10;

/** @type {(displayDimension: object) => object} */
const centerCoordinateGet = (displayDimension) =>
  Object.values(displayDimension).reduce((memo, value, index) => {
    const key = !index ? 'x' : 'y';

    return {
      ...memo,
      [key]: (value - dimension) * 0.5
    };
  }, {});

/** @type {(index: number) => number} */
const rotationGet = (index) => ((Math.PI * 2) / length) * index;

/** @type {(index: number, displayDimension: object) => object} */
const positionGet = (index, displayDimension) => {
  const { x, y } = centerCoordinateGet(displayDimension);

  const rotation = rotationGet(index);

  return /** @type {{ x: number; y: number }} */ (
    Object.entries({ x, y }).reduce((memo, [key, value], index) => {
      const [operator, _value, __value] = !index
        ? ['cos', x, 1]
        : ['sin', y, 2];

      return {
        ...memo,
        [key]: value + Math[operator](rotation * __value) * _value
      };
    }, {})
  );
};

const LayoutContainer_ = ({ index, displayDimension }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
      position={positionGet(index, displayDimension)}
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
        <LayoutContainer_
          key={index}
          index={index}
          displayDimension={displayDimension}
        />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
