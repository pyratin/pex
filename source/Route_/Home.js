import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';

import useStore from '#/component/useStore';

const delta = 0.1;

const length = (Math.PI * 2) / delta;

const yScale = 100;

/** @type {(index: number, dimension: object) => object} */
const positionGet = (index, dimension) => {
  return {
    x: index * dimension,
    y: Math.sin(index * delta) * yScale + yScale - dimension * 0.5
  };
};

const LayoutContainer__ = ({ index, dimension }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: dimension * 0.5,
        height: dimension * 0.5,
        borderWidth: 1,
        borderColor: 0xffffff
      }}
      position={positionGet(index, dimension)}
    ></pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const layoutInitializedFlagRef = useRef(false);

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

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
      onLayout={({ target }) => {
        !layoutInitializedFlagRef.current &&
          (() => {
            Object.assign(
              target,
              /** @type {pixiJs.ContainerOptions} */ ({
                layout: /** @type {pixiLayout.LayoutOptions} */ (
                  target.getSize()
                )
              })
            );

            Object.assign(layoutInitializedFlagRef, { current: true });
          })();
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
