import { useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Texture, Sprite, Graphics, Container } from 'pixi.js';

import useStore from '#/component/useStore';

/** @type {[string, string[]][]} */
const bundleDefinitionCollection = [
  ['start-screen', ['flowerTop']],
  ['game-screen', ['eggHead']]
];

const Sprite_ = () => {
  useExtend({ Container, Sprite, Graphics });

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const [bundleDefinitionIndex, bundleDefinitionIndexSet] = useState(0);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.init({
      manifest: {
        bundles: bundleDefinitionCollection.map(
          ([name, assetAliasCollection]) => ({
            name,
            assets: assetAliasCollection.map((alias) => ({
              alias,
              src: `/asset/image/${alias}.png`
            }))
          })
        )
      }
    });

    Assets.backgroundLoadBundle(
      bundleDefinitionCollection.map(([name]) => name)
    );
  }, []);

  useEffect(() => {
    const [name, assetAliasCollection] =
      bundleDefinitionCollection[bundleDefinitionIndex];

    Assets.loadBundle(name)
      .then((bundleObject) =>
        assetAliasCollection.map((alias) => bundleObject[alias])
      )
      .then(([texture]) => textureSet(texture));
  }, [bundleDefinitionIndex]);

  const onPointerTapHandle = () => {
    bundleDefinitionIndexSet((bundleDefinitionIndex) =>
      Number(!bundleDefinitionIndex)
    );
  };

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
      eventMode='static'
      cursor='pointer'
      onPointerTap={onPointerTapHandle}
    >
      <pixiSprite texture={texture} anchor={0.5} />

      <pixiGraphics
        draw={(graphics) =>
          graphics
            .clear()
            .rect(
              ...(() => {
                const { width, height } = texture;

                const padding = 20;

                return /** @type {const} */ ([
                  -width * 0.5 - padding,
                  -height * 0.5 - padding,
                  width + padding * 2,
                  height + padding * 2
                ]);
              })()
            )
            .stroke({ width: 1, color: 0xffffff })
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
      <Sprite_ />
    </pixiLayoutContainer>
  );
};

export default Home;
