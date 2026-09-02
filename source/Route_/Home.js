import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, AnimatedSprite } from 'pixi.js';

import useStore from '#/component/useStore';

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, AnimatedSprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState([Texture.EMPTY]);

  useEffect(() => {
    Assets.load('/asset/sprite/mc.json').then(({ textures }) =>
      textureCollectionSet(Object.values(textures))
    );
  }, []);

  useEffect(() => {
    textureCollection[0] !== Texture.EMPTY &&
      /** @type {pixiJs.AnimatedSprite} */ (
        /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
      ).gotoAndPlay(Math.floor(Math.random() * textureCollection.length));
  }, [textureCollection]);

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

        const [{ width: _width, height: _height }] =
          /** @type {pixiJs.Texture[]} */ (textureCollection);

        return /** @type {{ x: number; y: number }} */ (
          Object.entries({ x: width, y: height }).reduce(
            (memo, [key, value], index) => ({
              ...memo,
              [key]: Math.random() * value - (!index ? _width : _height) / 2
            }),
            {}
          )
        );
      })()}
      angle={(() => Math.random() * 360)()}
    >
      <pixiAnimatedSprite
        textures={textureCollection}
        layout={{
          ...(() => {
            const [{ width, height }] = /** @type {pixiJs.Texture[]} */ (
              textureCollection
            );

            const random = Math.random();

            return Object.entries({ width, height }).reduce(
              (memo, [key, value]) => ({
                ...memo,
                [key]: random * 0.5 * value + value
              }),
              {}
            );
          })()
        }}
        animationSpeed={0.5}
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
      {Array.from({ length: 50 }).map((_, index) => (
        <LayoutContainer_ key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
