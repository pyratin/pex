import { useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Texture, Sprite } from 'pixi.js';

/** @type {[string, string[]][]} */
const bundleDefinitionCollection = [
  ['load-screen', ['flowerTop']],
  ['game-screen', ['eggHead']]
];

const Sprite_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const [
    bundleDefinitionCollectionIndexActive,
    bundleDefinitionCollectionIndexActiveSet
  ] = useState(0);

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
  }, []);

  useEffect(() => {
    const [name, assetAliasCollection] =
      bundleDefinitionCollection[bundleDefinitionCollectionIndexActive];

    Assets.loadBundle(name)
      .then((assetObject) =>
        assetAliasCollection.map((alias) => assetObject[alias])
      )
      .then(([texture]) => textureSet(texture));
  }, [bundleDefinitionCollectionIndexActive]);

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
        bundleDefinitionCollectionIndexActiveSet(
          (bundleDefinitionCollectionIndexActive) =>
            Number(!bundleDefinitionCollectionIndexActive)
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
      <Sprite_ />
    </pixiLayoutContainer>
  );
};

export default Home;
