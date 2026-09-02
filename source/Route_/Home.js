import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const LayoutContainer_ = ({ index }) => {
  useExtend({ LayoutContainer, Sprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/sprite/monsters.json').then(({ textures }) => {
      const textureCollection = Object.values(textures);

      textureSet(textureCollection[index % textureCollection.length]);
    });
  }, [index]);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        pixi: { angle: 360 },
        repeat: -1,
        ease: 'none',
        duration: 5
      });
    },
    { dependencies: [] }
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
        tint={(() => Math.random() * 0xffffff)()}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      /** @type {(_: number, __: number, frame: number) => void} */
      const fn = (_, __, frame) =>
        Object.assign(
          ref.current,
          /** @type {pixiJs.ContainerOptions} */ ({
            scale: Math.sin(frame * 0.01),
            angle: frame
          })
        );

      gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [] }
  );

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
      onPointerTap={
        /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
        (event) => {
          event.stopPropagation();

          const { currentTarget } = event;

          currentTarget.cacheAsTexture(!currentTarget.isCachedAsTexture);
        }
      }
    >
      {Array.from({ length: 100 }).map((_, index) => (
        <LayoutContainer_ key={index} index={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
