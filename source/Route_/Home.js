import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Sprite } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const textureCollection = await Assets.load('/asset/sprite/monsters.json').then(
  ({ textures }) => Object.values(textures)
);

const Sprite_ = ({ index }) => {
  const texture = textureCollection[index % textureCollection.length];

  useExtend({ LayoutContainer, Sprite });

  const { dimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({ dimension }))
  );

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        pixi: { angle: 360 },
        repeat: -1,
        ease: 'none',
        duration: 2
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        borderWidth: 1,
        borderColor: '#ffffff22'
      }}
      position={(() => {
        const { width, height } = dimension;

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
      /** @type {(time: number, _: number, frame: number) => void} */
      const fn = (time, _, frame) => {
        Object.assign(
          ref.current,
          /** @type {pixiJs.ContainerOptions} */ ({
            scale: Math.sin(time),
            angle: frame
          })
        );
      };

      gsap.ticker.add(fn);

      return () => gsap.ticker.remove(fn);
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      label='Home'
      layout={{
        position: 'relative',
        flex: 1,
        borderWidth: 1,
        borderColor: '#ffffff22'
      }}
      eventMode='static'
      cursor='pointer'
      onPointerTap={
        /** @param {pixiJs.FederatedPointerEvent} event Evant */
        (event) => {
          event.stopPropagation();

          const { currentTarget } = event;

          currentTarget.cacheAsTexture(!currentTarget.isCachedAsTexture);
        }
      }
    >
      {Array.from({ length: 100 }).map((_, index) => (
        <Sprite_ key={index} index={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
