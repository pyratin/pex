import { useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import {
  Assets,
  Graphics,
  BlurFilter,
  Rectangle,
  Texture,
  Sprite
} from 'pixi.js';

import useStore from '#/component/useStore';

const radius = 90;

const blurStrength = 10;

const dimension = (radius + blurStrength) * 2;

const Sprite_ = () => {
  useExtend({ Sprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/bg_grass.jpg').then(textureSet);
  }, []);

  return <pixiSprite label='Sprite_' texture={texture} {...displayDimension} />;
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Graphics, Sprite });

  const {
    app: { renderer }
  } = useApplication();

  const ref = useRef(undefined);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    const refCurrentGraphics = /** @type {pixiJs.Graphics} */ (
      /** @type {pixiJs.Container} */ (ref.current).getChildByLabel('Graphics_')
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
  }, [renderer]);

  return (
    <pixiLayoutContainer
      ref={ref}
      label='LayoutContainer_'
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        label='Graphics_'
        draw={(graphics) =>
          graphics
            .circle(dimension / 2, dimension / 2, radius)
            .fill({ color: 0xffffff })
        }
        filters={[new BlurFilter({ strength: blurStrength })]}
      />

      <pixiSprite label='Sprite__' texture={texture} />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    refCurrent.getChildByLabel('Sprite_').setMask({
      mask: refCurrent
        .getChildByLabel('LayoutContainer_')
        .getChildByLabel('Sprite__')
    });
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000
      }}
      eventMode='static'
      cursor='pointer'
      onPointerMove={
        /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
        ({ client, currentTarget }) => {
          const element = currentTarget.getChildByLabel('LayoutContainer_');

          Object.assign(
            element,
            /** @type {pixiJs.ContainerOptions} */ ({
              position: (() => {
                const { x, y } = client;

                const { width, height } = element;

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
