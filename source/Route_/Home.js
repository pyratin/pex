import { useRef, useState, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Graphics, Text } from 'pixi.js';
import { DropShadowFilter } from 'pixi-filters';
import { World } from 'miniplex';
import { useEntities } from 'miniplex-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import Physics2DPlugin from 'gsap/Physics2DPlugin';
import random from 'random';
import { uid } from 'uid';
import niceColorPalettes from 'nice-color-palettes';

gsap.registerPlugin(useGSAP, PixiPlugin, Physics2DPlugin);
PixiPlugin.registerPIXI(pixiJs);

const palette = niceColorPalettes[0];

/** @typedef {{ x: number; y: number }} vectorType */

/**
 * @typedef {{
 *   key: string;
 *   radius: number;
 *   position: vectorType;
 * }} particleEntityType
 */

/** @type {World<particleEntityType>} */
const world = new World();

const Text_ = () => {
  useExtend({ LayoutContainer, Text });

  const [fontLoadedFlag, fontLoadedFlagSet] = useState(false);

  useEffect(() => {
    Assets.load({
      alias: 'Grandstander',
      src: '/asset/font/Grandstander-VariableFont_wght.ttf',
      data: { family: 'Grandstander' }
    }).then(() => fontLoadedFlagSet(true));
  }, []);

  return (
    fontLoadedFlag && (
      <pixiLayoutContainer
        layout={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 0x0000ff
        }}
      >
        <pixiText
          text='Click to create confetti'
          layout={{}}
          style={{
            fontFamily: 'Grandstander',
            fontSize: 56,
            fontWeight: 'bolder',
            fill: 0xffffff
          }}
          filters={[
            new DropShadowFilter({
              offset: { x: 0, y: 2 },
              blur: 2,
              alpha: 0.25,
              antialias: true
            })
          ]}
        />
      </pixiLayoutContainer>
    )
  );
};

const Entity = ({ particleEntity }) => {
  const { radius, position } = particleEntity;

  useExtend({ LayoutContainer, Graphics });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        keyframes: [
          {
            pixi: { scale: random.float(0.3, 1) },
            duration: 0.02,
            ease: 'power3.out'
          },
          {
            physics2D: {
              velocity: random.int(500, 1000),
              angle: random.int(0, 360),
              gravity: 1500
            },
            duration: 2,
            ease: 'none'
          }
        ],
        onComplete: () => world.remove(particleEntity)
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
      position={position}
      scale={0}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 5 },
          blur: 4,
          alpha: 0.25,
          antialias: true
        })
      ]}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics.circle(0, 0, radius).fill({ color: 0xffffff })
        }
        layout={{}}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const particleSystem = useEntities(world.with('key'));

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerTapHandle = ({ client }) => {
    Array.from({ length: random.int(15, 30) }).map(() => {
      const radius = random.int(20, 40);

      world.add({
        key: uid(),
        radius,
        position: /** @type {{ x: number; y: number }} */ (
          Object.entries({ ...client }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: Number(value) - radius
            }),
            {}
          )
        )
      });
    });
  };

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: palette[0]
      }}
      eventMode='static'
      cursor='pointer'
      onPointerTap={onPointerTapHandle}
    >
      <Text_ />

      {particleSystem.entities.map((particleEntity) => (
        <Entity key={particleEntity.key} particleEntity={particleEntity} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
