import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, AnimatedSprite } from 'pixi.js';

import useStore from '#/component/useStore';

const textureCollection = await Assets.load(
  '/asset/sprite/0123456789.json'
).then(({ textures, data: { frames } }) =>
  Object.entries(textures).map(([key, texture]) => ({
    texture,
    time: frames[key].duration
  }))
);

const AnimatedSprite_ = ({ index }) => {
  useExtend({ LayoutContainer, AnimatedSprite });

  const { scaleFactor } = useStore(
    useShallow(({ displayDefinition: { scaleFactor } }) => ({ scaleFactor }))
  );

  const ref = useRef(undefined);

  useEffect(() => {
    /** @type {pixiJs.AnimatedSprite} */ (
      /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
    ).play();
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        borderWidth: 1,
        borderColor: '#ffffff22',
        borderRadius: 8
      }}
    >
      <pixiAnimatedSprite
        textures={textureCollection}
        layout={{
          ...(() => {
            const [
              {
                texture: { width, height }
              }
            ] = /** @type {{ texture: pixiJs.Texture }[]} */ (
              textureCollection
            );

            return Object.entries({ width, height }).reduce(
              (memo, [key, value]) => ({
                ...memo,
                [key]: value * 3 * Math.min(scaleFactor * 1.5, 1)
              }),
              {}
            );
          })()
        }}
        animationSpeed={!index ? 0.5 : 1}
      />
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
        gap: 20,
        borderWidth: 1,
        borderColor: '#ffffff22'
      }}
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <AnimatedSprite_ key={index} index={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
