import { useMemo, useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, AnimatedSprite } from 'pixi.js';

import useStore from '#/component/useStore';

const AnimatedSprite_ = () => {
  useExtend({ AnimatedSprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState([Texture.EMPTY]);

  const dimension = useMemo(() => {
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
  }, [textureCollection]);

  useEffect(() => {
    Assets.load('/asset/sprite/mc.json').then(({ textures }) =>
      textureCollectionSet(Object.values(textures))
    );
  }, []);

  useEffect(() => {
    textureCollection[0] !== Texture.EMPTY &&
      /** @type {pixiJs.AnimatedSprite} */ (ref.current).gotoAndPlay(
        Math.floor(Math.random() * textureCollection.length)
      );
  }, [textureCollection]);

  return (
    <pixiAnimatedSprite
      ref={ref}
      textures={textureCollection}
      {...dimension}
      position={(() => {
        const { width, height } = displayDimension;

        return /** @type {{ x: number; y: number }} */ (
          Object.entries({ x: width, y: height }).reduce(
            (memo, [key, value], index) => {
              const _value = (() => {
                const [{ width, height }] = /** @type {pixiJs.Texture[]} */ (
                  textureCollection
                );

                return !index ? width : height;
              })();

              return {
                ...memo,
                [key]: Math.random() * value - _value * 0.5
              };
            },
            {}
          )
        );
      })()}
      rotation={(() => Math.random() * (Math.PI * 2))()}
      animationSpeed={0.5}
    />
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      {Array.from({ length: 50 }).map((_, index) => (
        <AnimatedSprite_ key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
