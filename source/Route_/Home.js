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

const Sprite_ = () => {
  useExtend({ Sprite });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const quickToCollectionRef = useRef(undefined);

  const [texture, textureSet] = useState(Texture.EMPTY);

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

  useGSAP(
    () => {
      const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

      Object.assign(quickToCollectionRef, {
        current: ['x', 'y'].map((key) =>
          gsap.quickTo(refCurrent, key, { duration: 0.6, ease: 'power3' })
        )
      });
    },
    { dependencies: [] }
  );

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onGlobalPointerMoveHandle = ({ global: { x, y } }) => {
    [x, y].map((value, index) => quickToCollectionRef.current?.[index](value));
  };

  return (
    <pixiSprite
      ref={ref}
      texture={texture}
      anchor={0.5}
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
      <Sprite_ />
    </pixiLayoutContainer>
  );
};

export default Home;
