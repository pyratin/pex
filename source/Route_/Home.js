import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Sprite, Text } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import 'pixi.js/advanced-blend-modes';

import useStore from '#/component/useStore';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const blendModeCollection = /** @type {pixiJs.BLEND_MODES[]} */ ([
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
]);

const textureCollection = await (async () => {
  const assetAliasCollection = ['panda', 'rainbow-gradient'];

  return await Assets.load(
    assetAliasCollection.map((alias) => ({
      alias,
      src: `/asset/image/${alias}.png`
    }))
  ).then((assetObject) =>
    assetAliasCollection.map((alias) => assetObject[alias])
  );
})();

await Assets.load({
  label: 'ShortStack',
  src: '/asset/font/ShortStack-Regular.ttf',
  data: { family: 'ShortStack' }
});

const Container__ = ({ index, dimension }) => {
  const blendMode = blendModeCollection[index];

  useExtend({ LayoutContainer, Sprite, Text });

  const { scaleFactor } = useStore(
    useShallow(({ displayDefinition: { scaleFactor } }) => ({ scaleFactor }))
  );

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.to(
        /** @type {pixiJs.Container} */ (ref.current).getChildByLabel(
          'Sprite_'
        ),
        {
          pixi: { angle: 360 },
          repeat: -1,
          ease: 'none',
          duration: 5
        }
      );
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
        label='Sprite_'
        texture={textureCollection[0]}
        layout={{
          width: dimension * 0.6,
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
            fontSize: 12 * scaleFactor,
            fontWeight: 'bolder'
          }}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const Container_ = () => {
  useExtend({ LayoutContainer });

  const { dimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          widthMinimum,
          dimension: { width }
        }
      }) => ({ dimension: Math.min(width, widthMinimum) })
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
        <Container__
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
      <Container_ />
    </pixiLayoutContainer>
  );
};

export default Home;
