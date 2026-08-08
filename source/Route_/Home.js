import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, AnimatedSprite } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const textureCollection = await Assets.load('/asset/sprite/fighter.json').then(
  ({ textures }) => Object.values(textures)
);

const AnimatedSprite_ = () => {
  useExtend({ LayoutContainer, AnimatedSprite });

  const ref = useRef(undefined);

  useEffect(() => {
    /** @type {pixiJs.AnimatedSprite} */ (
      /** @type {pixiJs.Container} */ (ref.current).getChildAt(0)
    ).play();
  }, []);

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
      <pixiAnimatedSprite textures={textureCollection} layout={{}} />
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
      <AnimatedSprite_ />
    </pixiLayoutContainer>
  );
};

export default Home;
