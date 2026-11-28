import { useMemo, useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Container, AnimatedSprite } from 'pixi.js';

import useStore from '#/component/useStore';

const AnimatedSprite_ = ({ index }) => {
  useExtend({ AnimatedSprite });

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState([
    { texture: Texture.EMPTY, time: 0 }
  ]);

  const dimension = useMemo(() => {
    const [
      {
        texture: { width, height }
      }
    ] = /** @type {{ texture: pixiJs.Texture }[]} */ (textureCollection);

    return /** @type {{ width: number; height: number }} */ (
      Object.entries({ width, height }).reduce(
        (memo, [key, value]) => ({
          ...memo,
          [key]: value * 4
        }),
        {}
      )
    );
  }, [textureCollection]);

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
      /** @type {pixiJs.AnimatedSprite} */ (ref.current).play();
  }, [textureCollection]);

  return (
    <pixiAnimatedSprite
      ref={ref}
      textures={textureCollection}
      anchor={0.5}
      {...dimension}
      position={(() => {
        const { width } = dimension;

        return { x: width * 0.3 * (!index ? -1 : 1), y: 0 };
      })()}
      animationSpeed={!index ? 0.5 : 1}
    />
  );
};

const Container_ = () => {
  useExtend({ Container });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  return (
    <pixiContainer
      position={(() => {
        const { width, height } = displayDimension;

        return /** @type {{ x: number; y: number }} */ (
          Object.entries({ x: width, y: height }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: value * 0.5
            }),
            {}
          )
        );
      })()}
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <AnimatedSprite_ key={index} index={index} />
      ))}
    </pixiContainer>
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
      <Container_ />
    </pixiLayoutContainer>
  );
};

export default Home;
