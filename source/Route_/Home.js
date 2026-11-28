import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Container, AnimatedSprite, Graphics } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

import useStore from '#/component/useStore';

const AnimatedSprite_ = () => {
  useExtend({ Container, AnimatedSprite, Graphics });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState([Texture.EMPTY]);

  useEffect(() => {
    Assets.load('/asset/sprite/fighter.json').then(({ textures }) =>
      textureCollectionSet(Object.values(textures))
    );
  }, []);

  useEffect(() => {
    textureCollection[0] !== Texture.EMPTY &&
      /** @type {pixiJs.AnimatedSprite} */ (
        /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
      ).play();
  }, [textureCollection]);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        pixi: { angle: 360 },
        duration: 5,
        ease: 'none',
        repeat: -1
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiContainer
      ref={ref}
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
      <pixiAnimatedSprite
        textures={textureCollection}
        anchor={0.5}
        animationSpeed={0.5}
      />

      <pixiGraphics
        draw={(graphics) =>
          graphics
            .clear()
            .rect(
              ...(() => {
                const [{ width, height }] = /** @type {pixiJs.Texture[]} */ (
                  textureCollection
                );

                const padding = 20;

                return /** @type {const} */ ([
                  -width * 0.5 - padding,
                  -height * 0.5 - padding,
                  width + padding * 2,
                  height + padding * 2
                ]);
              })()
            )
            .stroke({ width: 1, color: 0xffffff, alpha: 0.25 })
        }
      />
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
      <AnimatedSprite_ />
    </pixiLayoutContainer>
  );
};

export default Home;
