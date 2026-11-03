import { useState, useEffect, useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, Texture, Sprite } from 'pixi.js';

const assetAliasCollection = ['flowerTop', 'eggHead'];

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const ref = useRef(undefined);

  const [assetAliasIndexActive, assetAliasIndexActiveSet] = useState(0);

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
    Assets.load(assetAliasCollection[assetAliasIndexActive]).then(textureSet);
  }, [assetAliasIndexActive]);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        padding: 10,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
      eventMode='static'
      cursor='pointer'
      onPointerTap={() =>
        assetAliasIndexActiveSet((assetAliasIndexActive) =>
          Number(!assetAliasIndexActive)
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
