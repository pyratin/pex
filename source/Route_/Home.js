import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite, Text } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import 'pixi.js/advanced-blend-modes';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const LayoutContainer__ = ({ index, gridDimension }) => {
  const blendMode = /** @type {pixiJs.BLEND_MODES} */ (
    [
      'normal',
      'add',
      'screen',
      'darken',
      'lighten',
      'color-dodge',
      'color-burn',
      'linear-burn',
      'linear-dodge',
      'linear-light',
      'hard-light',
      'soft-light',
      'pin-light',
      'difference',
      'exclusion',
      'overlay',
      'saturation',
      'color',
      'luminosity',
      'add-npm',
      'subtract',
      'divide',
      'vivid-light',
      'hard-mix',
      'negation'
    ][index]
  );

  useExtend({ LayoutContainer, Sprite, Text });

  const { displayScaleFactor } = useStore(
    useShallow(({ displayDefinition: { scaleFactor } }) => ({
      displayScaleFactor: scaleFactor
    }))
  );

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState(
    Array.from({ length: 2 }).map(() => Texture.EMPTY)
  );

  useEffect(() => {
    const assetAliasCollection = ['panda', 'rainbow-gradient'];

    Assets.load(
      assetAliasCollection.map((alias) => ({
        alias,
        src: `/asset/image/${alias}.png`
      }))
    ).then((assetObject) =>
      textureCollectionSet(
        assetAliasCollection.map((alias) => assetObject[alias])
      )
    );
  }, []);

  useGSAP(
    () => {
      gsap.to(/** @type {pixiJs.Container} */ (ref.current).getChildAt(0), {
        pixi: { angle: 360 },
        duration: 10,
        repeat: -1,
        ease: 'none'
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        width: gridDimension,
        height: gridDimension,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 0x000000,
        backgroundColor: 0xffffff
      }}
    >
      <pixiSprite
        texture={textureCollection[0]}
        layout={{
          width: gridDimension * 0.75,
          objectFit: 'contain'
        }}
      />

      <pixiSprite
        texture={textureCollection[1]}
        layout={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
        blendMode={blendMode}
      />

      <pixiLayoutContainer
        layout={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 5,
          padding: 10 * displayScaleFactor,
          borderWidth: 1,
          borderColor: 0x00000,
          borderRadius: 4
        }}
      >
        <pixiText
          text={blendMode}
          layout={{}}
          style={{
            fontFamily: 'ShortStack',
            fontSize: 12 * displayScaleFactor,
            fontWeight: 'bolder',
            fill: 0x00000
          }}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const { displayDimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          widthMaximum,
          dimension: { width }
        }
      }) => ({
        displayDimension: Math.min(widthMaximum, width)
      })
    )
  );

  const [fontLoadedFlag, fontLoadedFlagSet] = useState(false);

  useEffect(() => {
    Assets.load({
      alias: 'ShortStack',
      src: '/asset/font/ShortStack-Regular.ttf',
      data: { family: 'ShortStack' }
    }).then(() => fontLoadedFlagSet(true));
  }, []);

  return (
    fontLoadedFlag && (
      <pixiLayoutContainer
        layout={{
          width: displayDimension,
          height: displayDimension,
          flexWrap: 'wrap',
          borderWidth: 0,
          borderColor: 0x00ff00
        }}
      >
        {Array.from({ length: 5 ** 2 }).map((_, index, collection) => (
          <LayoutContainer__
            key={index}
            index={index}
            gridDimension={displayDimension / collection.length ** 0.5}
          />
        ))}
      </pixiLayoutContainer>
    )
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
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
