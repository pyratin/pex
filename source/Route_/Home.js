import { useMemo } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';

import useStore from '#/component/useStore';

const delta = 0.1;

const length = (Math.PI * 2) / delta;

const yScale = 100;

/** @type {(index: number, gridDimension: object) => object} */
const positionGet = (index, gridDimension) => ({
  x: index * gridDimension,
  y: Math.sin(index * delta) * yScale + yScale
});

const LayoutContainer__ = ({ index, gridDimension }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: gridDimension,
        height: gridDimension,
        borderWidth: 1,
        borderColor: 0xffffff
      }}
      position={positionGet(index, gridDimension)}
    ></pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          widthMaximum,
          dimension: { width }
        }
      }) => ({
        displayDimension: Math.min(widthMaximum, width)
      })
    )
  );

  const gridDimension = useMemo(
    () => displayDimension / length,
    [displayDimension]
  );

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        width: displayDimension,
        height: yScale * 2 + gridDimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <LayoutContainer__
          key={index}
          index={index}
          gridDimension={gridDimension}
        />
      ))}
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
