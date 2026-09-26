import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';

import useStore from '#/component/useStore';

const delta = 0.1;

const length = (Math.PI * 2) / delta;

/** @type {(index: number, dimension: number) => object} */
const positionGet = (index, dimension) => {
  const yScale = 100;

  return {
    x: index * dimension,
    y: Math.sin(index * delta) * yScale + yScale
  };
};

const LayoutContainer__ = ({ index, dimension }) => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        width: dimension / 2,
        height: dimension / 2,
        borderWidth: 0,
        borderColor: 0x0000ff,
        backgroundColor: 0xffffff
      }}
      position={positionGet(index, dimension)}
    ></pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const layoutInitializedFlagRef = useRef(false);

  const { dimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          dimension: { width }
        }
      }) => ({
        dimension: width / length
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
        <LayoutContainer__ key={index} index={index} dimension={dimension} />
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
