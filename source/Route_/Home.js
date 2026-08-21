import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
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

const assetAliasCollection = ['panda', 'rainbow-gradient'];

const LayoutContainer__ = ({ index, dimension }) => {
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

  const { displayDefinitionScaleFactor } = useStore(
    useShallow(({ displayDefinition: { scaleFactor } }) => ({
      displayDefinitionScaleFactor: scaleFactor
    }))
  );

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState(
    Array.from({ length: 2 }).map(() => Texture.EMPTY)
  );

  useEffect(() => {
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

    Assets.load({
      alias: 'ShortStack',
      src: '/asset/font/ShortStack-Regular.ttf',
      data: { family: 'ShortStack' }
    });
  }, []);

  useGSAP(
    () => {
      gsap.to(/** @type {pixiJs.Container} */ (ref.current).getChildAt(0), {
        pixi: { angle: 360 * (index % 2 ? -1 : 1) },
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
        position: 'relative',
        width: dimension,
        height: dimension,
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
          width: dimension * 0.75,
          objectFit: 'contain'
        }}
      />

      <pixiSprite
        texture={textureCollection[1]}
        layout={{ position: 'absolute', width: '100%', height: '100%' }}
        blendMode={blendMode}
      />

      <pixiLayoutContainer
        layout={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 5,
          padding: 10,
          borderWidth: 1,
          borderColor: 0x000000,
          borderRadius: 4
        }}
      >
        <pixiText
          text={blendMode}
          layout={{}}
          style={{
            fontFamily: 'ShortStack',
            fontSize: 12 * displayDefinitionScaleFactor,
            fontWeight: 'bolder'
          }}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const { dimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          widthMaximum,
          dimension: { width }
        }
      }) => ({
        dimension: Math.min(widthMaximum, width)
      })
    )
  );

  return (
    <pixiLayoutContainer
      layout={{
        width: dimension,
        height: dimension,
        flexWrap: 'wrap',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      {Array.from({ length: 25 }).map((_, index, collection) => (
        <LayoutContainer__
          key={index}
          index={index}
          dimension={Math.floor(dimension / collection.length ** 0.5)}
        />
      ))}
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
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
