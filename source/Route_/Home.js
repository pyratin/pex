import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import _ from 'lodash';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite, Rectangle } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const rectangleGet = _.memoize(
  (textureDimension) => {
    const padding = (() => {
      const { width, height } = textureDimension;

      return Math.max(width, height);
    })();

    const { width, height } = (() => {
      const { getState } = useStore;

      const {
        displayDefinition: { dimension }
      } = getState();

      return dimension;
    })();

    return new Rectangle(
      -padding,
      -padding,
      width + padding * 2,
      height + padding * 2
    );
  },
  ({ width, height }) => `${width}-${height}`
);

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/eggHead.png').then(textureSet);
  }, []);

  useGSAP(
    () => {
      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      let rotation = Math.random() * (Math.PI * 2);

      const rotationDelta = Math.random() * 0.01;

      const speed = Math.random() * 2 + 2;

      const fn = () => {
        rotation += rotationDelta;

        const _position = (() => {
          const {
            position: { x, y }
          } = refCurrent;

          return /** @type {{ x: number; y: number }} */ (
            Object.entries({ x, y }).reduce(
              (memo, [key, value], index) => ({
                ...memo,
                [key]: value + Math[!index ? 'cos' : 'sin'](rotation) * speed
              }),
              {}
            )
          );
        })();

        const position = {
          ..._position,
          ...(() => {
            const rectangle = rectangleGet(
              (() => {
                const { width, height } = texture;

                return { width, height };
              })()
            );

            switch (true) {
              case _position.x < rectangle.x:
                return { x: _position.x + rectangle.width };

              case _position.x > rectangle.x + rectangle.width:
                return { x: _position.x - rectangle.width };

              case _position.y < rectangle.y:
                return { y: _position.y + rectangle.height };

              case _position.y > rectangle.y + rectangle.height:
                return { y: _position.y - rectangle.height };
            }
          })()
        };

        Object.assign(
          refCurrent,
          /** @type {pixiJs.ContainerOptions} */ ({
            position,
            rotation
          })
        );
      };

      texture !== Texture.EMPTY && gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [texture] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
      position={(() => {
        const { width, height } = displayDimension;

        const { width: _width, height: _height } = texture;

        return /** @type {{ x: number; y: number }} */ (
          Object.entries({
            x: width - _width,
            y: height - _height
          }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: Math.random() * value
            }),
            {}
          )
        );
      })()}
    >
      <pixiSprite
        texture={texture}
        layout={{}}
        rotation={Math.PI / 2}
        tint={(() => Math.random() * 0xffffff)()}
      />
    </pixiLayoutContainer>
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
      {Array.from({ length: 20 }).map((_, index) => (
        <LayoutContainer_ key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
