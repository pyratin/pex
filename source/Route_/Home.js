import { useRef, useState, useEffect } from 'react';
import { LayoutContainer } from '@pixi/layout/components';
import { useExtend } from '@pixi/react';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, AnimatedSprite } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, AnimatedSprite });

  const ref = useRef(undefined);

  const [textureCollection, textureCollectionSet] = useState([Texture.EMPTY]);

  useEffect(() => {
    Assets.load('/asset/sprite/fighter.json').then(({ textures }) =>
      textureCollectionSet(Object.values(textures))
    );
  }, []);

  useEffect(() => {
    textureCollection[0] !== Texture.EMPTY &&
      /** @type {pixiJs.AnimatedSprite} */ (
        /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
      ).play();
  }, [textureCollection]);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        pixi: { angle: 360 },
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
        padding: 20,
        borderWidth: 1,
        borderColor: '#ffffff22',
        borderRadius: 8
      }}
    >
      <pixiAnimatedSprite
        textures={textureCollection}
        layout={{}}
        animationSpeed={0.5}
      />
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
