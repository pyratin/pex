import { useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Texture, Sprite } from 'pixi.js';

/** @type {[string, string[]][]} */
const bundleDefinitionCollection = [
  ['load-screen', ['flowerTop']],
  ['game-screen', ['eggHead']]
];

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const [bundleDefinitionIndexActive, bundleDefinitionIndexActiveSet] =
    useState(0);

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
      bundleDefinitionCollection[bundleDefinitionIndexActive];

    Assets.loadBundle(name)
      .then((assetObject) =>
        assetAliasCollection.map((alias) => assetObject[alias])
      )
      .then(([texture]) => textureSet(texture));
  }, [bundleDefinitionIndexActive]);

  return (
    <pixiLayoutContainer
      layout={{
        padding: 20,
        borderWidth: 1,
        borderColor: '#ffffff22',
        borderRadius: 8
      }}
      eventMode='static'
      cursor='pointer'
      onPointerTap={() =>
        bundleDefinitionIndexActiveSet((bundleDefinitionIndexActive) =>
          Number(!bundleDefinitionIndexActive)
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
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
