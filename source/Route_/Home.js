import { useMemo, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import { Assets, BitmapFont, BitmapText } from 'pixi.js';
import random from 'random';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import niceColorPalettes from 'nice-color-palettes';

import useStore from '#/component/useStore';

const seed = -1;

random.use(seed);

const noiseGet = createNoise2D(alea(seed));

const Entity = ({ entity: { dimension, position, rotation, color } }) => {
  useExtend({ LayoutContainer, BitmapText });

  return (
    <pixiBitmapText
      text='='
      style={{
        fontFamily: '_Grandstander',
        fontSize: Math.max(24, dimension * 3),
        fill: color
      }}
      position={position}
      rotation={rotation}
    />
  );
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

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

  const entityCollection = useMemo(() => {
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
      {entityCollection.map((entity, index) => (
        <Entity key={index} entity={entity} />
      ))}
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const [fontLoadedFlag, fontLoadedFlagSet] = useState(false);

  useEffect(() => {
    Assets.load({
      alias: 'Grandstander',
      src: '/asset/font/Grandstander-VariableFont_wght.ttf',
      data: { family: 'Grandstander' }
    })
      .then(() => {
        return BitmapFont.install({
          name: '_Grandstander',
          style: {
            fontFamily: 'Grandstander',
            fontSize: 64,
            fontWeight: 'lighter',
            fill: 0xffffff
          }
        });
      })
      .then(() => fontLoadedFlagSet(true));
  }, []);

  return (
    fontLoadedFlag && (
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
    )
  );
};

export default Home;
