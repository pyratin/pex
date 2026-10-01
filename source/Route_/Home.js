import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';

import useStore from '#/component/useStore';

const delta = 0.1;

const length = (Math.PI * 2) / delta;

/** @type {(index: number, dimension: number) => object} */
const positionGet = (index, dimension) => {
  const yScale = 350;

  return {
    x: index * dimension,
    y: (dimension * length) / 2 + Math.sin(index * delta) * yScale
  };
};

const LayoutContainer__ = ({ index, dimension }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension
      }}
      position={positionGet(index, dimension)}
    >
      <pixiLayoutContainer
        layout={{
          width: dimension * 0.5,
          height: dimension * 0.5,
          borderWidth: 1,
          borderColor: 0xffffff
        }}
      ></pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          dimension: { width, height }
        }
      }) => ({
        displayDimension: Math.min(width, height)
      })
    )
  );

  return (
    <pixiLayoutContainer
      layout={{
        width: displayDimension,
        height: displayDimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <LayoutContainer__
          key={index}
          index={index}
          dimension={displayDimension / length}
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
