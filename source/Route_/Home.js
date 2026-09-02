import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, AnimatedSprite } from 'pixi.js';

const LayoutContainer_ = ({ index }) => {
  useExtend({ LayoutContainer, AnimatedSprite });

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState([
    { texture: Texture.EMPTY, time: 0 }
  ]);

  useEffect(() => {
    Assets.load('/asset/sprite/0123456789.json').then(
      ({ textures, data: { frames } }) =>
        textureCollectionSet(
          Object.entries(textures).map(([key, texture]) => ({
            texture,
            time: frames[key].duration
          }))
        )
    );
  }, []);

  useEffect(() => {
    textureCollection[0].texture !== Texture.EMPTY &&
      /** @type {pixiJs.AnimatedSprite} */ (
        /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
      ).play();
  }, [textureCollection]);

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
                [key]: value * 3
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
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <LayoutContainer_ key={index} index={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
