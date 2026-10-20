import { useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Texture, Sprite } from 'pixi.js';

const assetAliasCollection = ['flowerTop', 'eggHead'];

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const [assetAliasIndex, assetAliasIndexSet] = useState(0);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.add(
      assetAliasCollection.map((alias) => ({
        alias,
        src: `/asset/image/${alias}.png`
      }))
    );

    Assets.backgroundLoad(assetAliasCollection);
  }, []);

  useEffect(() => {
    Assets.load(assetAliasCollection[assetAliasIndex]).then(textureSet);
  }, [assetAliasIndex]);

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
        assetAliasIndexSet((assetAliasIndex) => Number(!assetAliasIndex))
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
