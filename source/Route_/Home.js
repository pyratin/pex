import { useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Sprite } from 'pixi.js';

const assetAliasCollection = ['flowerTop', 'eggHead'];

Assets.add(
  assetAliasCollection.map((alias) => ({
    alias,
    src: `/asset/image/${alias}.png`
  }))
);

Assets.backgroundLoad(assetAliasCollection);

const Sprite_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const [assetAliasCollectionIndexActive, assetAliasCollectionIndexActiveSet] =
    useState(0);

  const [texture, textureSet] = useState(undefined);

  useEffect(() => {
    Assets.load(assetAliasCollection[assetAliasCollectionIndexActive]).then(
      textureSet
    );
  }, [assetAliasCollectionIndexActive]);

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
        assetAliasCollectionIndexActiveSet((assetAliasCollectionIndexActive) =>
          Number(!assetAliasCollectionIndexActive)
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
        borderColor: '#ffffff22'
      }}
    >
      <Sprite_ />
    </pixiLayoutContainer>
  );
};

export default Home;
