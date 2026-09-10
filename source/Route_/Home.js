import { useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Texture, Sprite } from 'pixi.js';

/** @type {[string, string[]][]} */
const bundleDefinitionCollection = [
  ['start-screen', ['flowerTop']],
  ['game-screen', ['eggHead']]
];

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

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
      .then((assetObject) =>
        assetAliasCollection.map((alias) => assetObject[alias])
      )
      .then(([texture]) => textureSet(texture));
  }, [bundleDefinitionIndex]);

  return (
    <pixiLayoutContainer
      layout={{
        padding: 20,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
      eventMode='static'
      cursor='pointer'
      onPointerTap={() =>
        bundleDefinitionIndexSet((bundleDefinitionIndex) =>
          Number(!bundleDefinitionIndex)
        )
      }
    >
      <pixiSprite texture={texture} layout={{}} />
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
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
