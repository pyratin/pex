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

const seed = Math.random();

random.use(seed);

const noiseGet = createNoise2D(alea(seed));

const Entity = ({ entity: { dimension, position, roration, color } }) => {
  useExtend({ BitmapText });

  return (
    <pixiBitmapText
      text='='
      style={{
        fontFamily: '_Grandstander',
        fontSize: Math.max(18, dimension * 3),
        fontWeight: 'lighter',
        fill: color
      }}
      position={position}
      rotation={roration}
    />
  );
};

/**
 * @type {(
 *   _position: object,
 *   dimension: number,
 *   gridDimension: number
 * ) => object}
 */
const positionGet = (_position, dimension, gridDimension) =>
  Object.entries(_position).reduce(
    (memo, [key, value]) => ({
      ...memo,
      [key]: value * gridDimension + (gridDimension - dimension) * 0.5
    }),
    {}
  );

const LayoutContainer_ = () => {
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
        const _position = {
          x: index % rowColumnCount,
          y: Math.floor(index / rowColumnCount)
        };

        const noise =
          noiseGet(
            .../** @type {[number, number]} */ (
              Object.values(_position).map((value) => value * 0.05)
            )
          ) *
            0.5 +
          0.5;

        const dimension = noise * gridDimension;

        return {
          index,
          dimension,
          position: positionGet(_position, dimension, gridDimension),
          roration: noise * (Math.PI * 2),
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
        width: displayDimension,
        height: displayDimension,
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
    >
      {entityCollection.map((entity) => (
        <Entity key={entity.index} entity={entity} />
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
      .then(() =>
        BitmapFont.install({
          name: '_Grandstander',
          style: {
            fontFamily: 'Grandstander',
            fontSize: 64,
            fontWeight: 'lighter',
            fill: 0xffffff
          },
          chars: ['=']
        })
      )
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
