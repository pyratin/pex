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

/**
 * @type {(
 *   _position: object,
 *   dimension: number,
 *   gridDimension: number
 * ) => object}
 */
const positionGet = (positionNormalized, dimension, gridDimension) => {
  return Object.values(positionNormalized).reduce((memo, value, index) => {
    const key = !index ? 'x' : 'y';

    return {
      ...memo,
      [key]: value * gridDimension + (gridDimension - dimension) * 0.5
    };
  }, {});
};

/** @type {(displayDimension: object) => object[]} */
const entityCollectionGet = (displayDimension) => {
  const rowColumnCount = 50;

  const gridDimension = displayDimension / rowColumnCount;

  const palette = random.choice(niceColorPalettes);

  return Array.from({ length: rowColumnCount ** 2 })
    .map((_, index) => {
      const positionNormalized = [
        index % rowColumnCount,
        Math.floor(index / rowColumnCount)
      ];

      const noise =
        noiseGet(
          .../** @type {[number, number]} */ (
            Object.values(positionNormalized).map((value) => value * 0.05)
          )
        ) *
          0.5 +
        0.5;

      const dimension = noise * gridDimension;

      return {
        index,
        dimension,
        position: positionGet(positionNormalized, dimension, gridDimension),
        rotation: noise * (Math.PI * 2),
        color:
          palette[
            Math.min(Math.floor(noise * palette.length), palette.length - 1)
          ]
      };
    })
    .filter(() => random.boolean());
};

const Entity = ({ entity: { dimension, position, rotation, color } }) => {
  useExtend({ LayoutContainer, BitmapText });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
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
          fontFamily: '_Grandstander',
          fontSize: Math.max(12, dimension * 3),
          fontWeight: 'lighter',
          fill: color
        }}
      />
    </pixiLayoutContainer>
  );
};

const LayoutContainer_ = () => {
  const { displayDimension } = useStore(
    useShallow(
      ({
        displayDefinition: {
          widthMaximum,
          dimension: { width }
        }
      }) => ({
        displayDimension: Math.max(widthMaximum, width)
      })
    )
  );

  const entityCollection = useMemo(
    () => entityCollectionGet(displayDimension),
    [displayDimension]
  );

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
            fontSize: 32,
            fontWeight: 'lighter',
            fill: 0xffffff
          },
          chars: '='
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
