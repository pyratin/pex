import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Text } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import niceColorPalettes from 'nice-color-palettes';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const palette = niceColorPalettes[0];

const textCollection = ['PixiJS', '&', 'GSAP', '💚'];

const Text_ = ({ text }) => {
  useExtend({ LayoutContainer, Text });

  return (
    <pixiLayoutContainer
      layout={{
        padding: 10,
        borderWidth: 4,
        borderColor: 0xffffff,
        borderRadius: 8,
        backgroundColor: palette[3]
      }}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 5 },
          blur: 4,
          alpha: 0.25,
          antialias: true
        })
      ]}
    >
      <pixiText
        text={text}
        layout={{}}
        style={{
          fontSize: 56,
          fontWeight: 'bolder',
          fill: 0xffffff
        }}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.from(
        /** @type {pixiJs.Container} */ (ref.current).children.find(
          ({ children }) => children.length
        ).children,
        {
          pixi: {
            y: -100,
            angle: 'random(-80, 80)',
            alpha: 0
          },
          duration: 1,
          stagger: 0.1,
          repeat: -1,
          yoyo: true,
          ease: 'back',
          repeatDelay: 1
        }
      );
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
    >
      {textCollection.map((text, index) => (
        <Text_ key={index} text={text} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
