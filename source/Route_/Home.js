import { useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import {
  Assets,
  Texture,
  Graphics,
  Sprite,
  BlurFilter,
  Rectangle
} from 'pixi.js';

import useStore from '#/component/useStore';

const Sprite_ = () => {
  useExtend({ Sprite });

  const { displayDefinitionDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDefinitionDimension: dimension
    }))
  );

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/bg_grass.jpg').then(textureSet);
  }, []);

  return <pixiSprite texture={texture} {...displayDefinitionDimension} />;
};

const LayoutContainer_ = () => {
  const radius = 90;

  const blurStrength = 10;

  const dimension = (radius + blurStrength) * 2;

  useExtend({ LayoutContainer, Graphics, Sprite });

  const {
    app: { renderer }
  } = useApplication();

  const ref = useRef(undefined);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    const refCurrentGraphics = /** @type {pixiJs.Graphics} */ (
      /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
    );

    textureSet(
      renderer.generateTexture({
        target: refCurrentGraphics,
        frame: new Rectangle(0, 0, dimension, dimension)
      })
    );

    Object.assign(
      refCurrentGraphics,
      /** @type {pixiJs.GraphicsOptions} */ ({
        visible: false
      })
    );
  }, [dimension, renderer]);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics.circle(dimension / 2, dimension / 2, radius).fill(0xffffff)
        }
        filters={[new BlurFilter({ strength: blurStrength })]}
      />

      <pixiSprite texture={texture} />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    refCurrent.getChildAt(0).setMask({
      mask: refCurrent.getChildAt(1).getChildAt(1)
    });
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
      eventMode='static'
      cursor='pointer'
      onPointerMove={
        /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
        ({ client, currentTarget }) => {
          const currentTargetLayoutContainer = currentTarget.getChildAt(1);

          Object.assign(
            currentTargetLayoutContainer,
            /** @type {pixiJs.ContainerOptions} */ ({
              position: (() => {
                const { x, y } = client;

                const { width, height } = currentTargetLayoutContainer;

                return { x: x - width / 2, y: y - height / 2 };
              })()
            })
          );
        }
      }
    >
      <Sprite_ />

      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
