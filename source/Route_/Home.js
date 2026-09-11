import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import {
  Assets,
  Graphics,
  BlurFilter,
  Texture,
  Sprite,
  Rectangle
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

  return (
    <pixiSprite label='Sprite__' texture={texture} {...displayDimension} />
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Graphics, Sprite });

  const {
    app: { renderer }
  } = useApplication();

  const ref = useRef(undefined);

  const layoutInitializedFlagRef = useRef(false);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useLayoutEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    const refCurrentGraphics = /** @type {pixiJs.Graphics} */ (
      refCurrent.getChildByLabel('Graphics_')
    );

    const onLayoutHandle = () => {
      !layoutInitializedFlagRef.current &&
        (() => {
          const texture = renderer.generateTexture({
            target: refCurrentGraphics,
            frame: new Rectangle(
              -dimension / 2,
              -dimension / 2,
              dimension,
              dimension
            )
          });

          textureSet(texture);

          Object.assign(
            refCurrentGraphics,
            /** @type {pixiJs.GraphicsOptions} */ ({
              visible: false
            })
          );

          Object.assign(layoutInitializedFlagRef, { current: true });
        })();
    };

    refCurrent.on('layout', onLayoutHandle);

    return () => {
      refCurrent.off('layout', onLayoutHandle);
    };
  }, [renderer]);

  return (
    <pixiLayoutContainer
      ref={ref}
      label='LayoutContainer_'
      layout={{
        position: 'absolute',
        width: dimension,
        height: dimension,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        label='Graphics_'
        draw={(graphics) =>
          graphics.circle(0, 0, radius).fill({ color: 0xffffff })
        }
        layout={{}}
        filters={[new BlurFilter({ strength: blurStrength })]}
      />

      <pixiLayoutContainer
        label='LayoutContainer__'
        layout={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 0,
          borderColor: 0x0000ff
        }}
      >
        <pixiSprite label='Sprite__' texture={texture} layout={{}} />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    refCurrent.getChildByLabel('Sprite__').setMask({
      mask: refCurrent
        .getChildByLabel('LayoutContainer_')
        .getChildByLabel('LayoutContainer__')
        .getChildByLabel('Sprite__')
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
          const element = currentTarget.getChildByLabel('LayoutContainer_');

          Object.assign(
            element,
            /** @type {pixiJs.ContainerOptions} */ ({
              position: (() => {
                const { x, y } = client;

                const { width, height } = element;

                return Object.entries({ x, y }).reduce(
                  (memo, [key, value], index) => ({
                    ...memo,
                    [key]: value - (!index ? width : height) / 2
                  }),
                  {}
                );
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
