import { useMemo, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import random from 'random';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import niceColorPalettes from 'nice-color-palettes';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, BitmapFont, BitmapText } from 'pixi.js';

import useStore from '#/component/useStore';

const seed = Math.random();

random.use(seed);

const noiseGet = createNoise2D(alea(seed));

const LayoutContainer__ = ({
  definition: { dimension, position, rotation, color }
}) => {
  useExtend({ LayoutContainer, BitmapText });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: color
      }}
      position={position}
      rotation={rotation}
    >
      <pixiBitmapText
        text='='
        layout={{}}
        style={{
          fontFamily: '_ShortStack',
          fontSize: dimension * 3,
          fill: color
        }}
      />
    </pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  useEffect(() => {
    Assets.load({
      alias: 'ShortStack',
      src: '/asset/font/ShortStack-Regular.ttf',
      data: { family: 'ShortStack' }
    }).then(() => {
      BitmapFont.install({
        name: '_ShortStack',
        style: {
          fontFamily: 'ShortStack',
          fontSize: 32,
          fontWeight: 'lighter',
          fill: 0xffffff
        }
      });
    });
  }, []);

  const { displayDimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          widthMaximum,
          dimension: { width }
        }
      }) => ({
        displayDimension: Math.min(widthMaximum, width)
      })
    )
  );

  const definitionCollection = useMemo(() => {
    const rowColumnCount = 50;

    const gridDimension = displayDimension / rowColumnCount;

    const palette = random.choice(niceColorPalettes);

    return Array.from({ length: rowColumnCount ** 2 })
      .map((_, index) => {
        const [x, y] = [
          index % rowColumnCount,
          Math.floor(index / rowColumnCount)
        ];

        const noise =
          noiseGet(
            .../** @type {[number, number]} */ (
              [x, y].map((value) => value * 0.05)
            )
          ) *
            0.5 +
          0.5;

        const dimension = noise * gridDimension;

        return {
          dimension,
          position: Object.entries({ x, y }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: value * gridDimension + (gridDimension - dimension) * 0.5
            }),
            {}
          ),
          rotation: noise * (Math.PI * 2),
          color:
            palette[
              Math.min(Math.floor(noise * palette.length), palette.length - 1)
            ]
        };
      })
      .filter(() => random.boolean());
  }, [displayDimension]);

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        width: displayDimension,
        height: displayDimension,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
    >
      {definitionCollection.map((definition, index) => (
        <LayoutContainer__ key={index} definition={definition} />
      ))}
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
