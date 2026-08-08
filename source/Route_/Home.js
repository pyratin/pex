import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, AnimatedSprite } from 'pixi.js';

import useStore from '#/component/useStore';

const textureCollection = await Assets.load('/asset/sprite/mc.json').then(
  ({ textures }) => Object.values(textures)
);

const AnimatedSprite_ = () => {
  useExtend({ LayoutContainer, AnimatedSprite });

  const { dimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({ dimension }))
  );

  const ref = useRef(undefined);

  useEffect(() => {
    /** @type {pixiJs.AnimatedSprite} */ (
      /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
    ).gotoAndPlay(Math.floor(Math.random() * textureCollection.length));
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        borderWidth: 0,
        borderColor: '#ffffff22'
      }}
      position={(() => {
        const { width, height } = dimension;

        const [{ width: _width, height: _height }] =
          /** @type {pixiJs.Texture[]} */ (textureCollection);

        return {
          x: Math.random() * width - _width / 2,
          y: Math.random() * height - _height / 2
        };
      })()}
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
        angle={(() => Math.random() * 360)()}
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
        borderWidth: 1,
        borderColor: '#ffffff22'
      }}
    >
      {Array.from({ length: 50 }).map((_, index) => (
        <AnimatedSprite_ key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
