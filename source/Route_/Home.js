import { useState, useEffect, useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Text } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import niceColorPalettes from 'nice-color-palettes';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const textCollection = ['PixiJs', '&', 'GSAP', '❤️'];

const palette = niceColorPalettes[0];

const LayoutContainer_ = ({ text }) => {
  useExtend({ LayoutContainer, Text });

  return (
    <pixiLayoutContainer
      layout={{
        padding: 10,
        borderWidth: 6,
        borderColor: palette[2],
        borderRadius: 8,
        backgroundColor: palette[3]
      }}
      filters={[
        new DropShadowFilter({
          color: 0x000000,
          blur: 4,
          offset: { x: 0, y: 10 },
          alpha: 0.25
        })
      ]}
    >
      <pixiText
        text={text}
        layout={{}}
        style={{
          fontFamily: 'Grandstander',
          fontSize: 64,
          fontWeight: 'bolder',
          fill: palette[2]
        }}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  const [, fontLoadedFlagSet] = useState(false);

  useEffect(() => {
    Assets.load({
      alias: 'Grandstander',
      src: '/asset/font/Grandstander-VariableFont_wght.ttf',
      data: { family: 'Grandstander' }
    }).then(() => fontLoadedFlagSet(true));
  }, []);

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
          stagger: 0.1,
          repeat: -1,
          yoyo: true,
          repeatDelay: 1,
          ease: 'back',
          duration: 1.5
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
        gap: 10,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
    >
      {textCollection.map((text, index) => (
        <LayoutContainer_ key={index} text={text} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
