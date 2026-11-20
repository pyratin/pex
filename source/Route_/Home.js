import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

import useStore from '#/component/useStore';

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const gsapQuickToFunctionCollectionRef = useRef(undefined);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Object.assign(gsapQuickToFunctionCollectionRef, {
      current: ['x', 'y'].map((key) =>
        gsap.quickTo(ref.current, key, { duration: 0.6, ease: 'power3' })
      )
    });
  }, []);

  useEffect(() => {
    Assets.load('/asset/image/bunny.png').then((texture) => {
      Object.assign(
        texture.source,
        /** @type {pixiJs.TextureSourceOptions} */ ({
          scaleMode: 'nearest',
          resolution: 1 / 5
        })
      );

      /** @type {pixiJs.Texture} */ (texture).update();

      textureSet(texture);
    });
  }, []);

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onGlobalPointerMoveHandle = ({ client: { x, y } }) => {
    [x, y].map((value, index) =>
      gsapQuickToFunctionCollectionRef.current[index](value)
    );
  };

  return (
    <pixiLayoutContainer
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
      eventMode='static'
      cursor='pointer'
      onGlobalPointerMove={onGlobalPointerMoveHandle}
    >
      <pixiSprite anchor={0.5} texture={texture} />
    </pixiLayoutContainer>
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
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
