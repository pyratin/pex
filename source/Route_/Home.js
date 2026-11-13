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

const palette = niceColorPalettes[0];

const Text_ = () => {
  useExtend({ Text });

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
      <pixiText
        text='Click to create confetti'
        layout={{}}
        style={{
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
    )
  );
};

const ParticleEntity = ({ particleEntity }) => {
  const { radius, position } = particleEntity;

  useExtend({ Graphics });

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
    <pixiGraphics
      ref={ref}
      draw={(graphics) =>
        graphics.circle(0, 0, radius).fill({ color: 0xffffff })
      }
      position={position}
      filters={[
        new DropShadowFilter({
          offset: { x: 0, y: 5 },
          blur: 5,
          alpha: 0.25,
          antialias: true
        })
      ]}
    />
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const particleSystem = useEntities(world.with('key'));

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerTapHandle = ({ client }) => {
    Array.from({ length: random.int(15, 30) }).map(() => {
      world.add({
        key: uid(),
        radius: random.int(30, 40),
        position: client
      });
    });
  };

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        <ParticleEntity
          key={particleEntity.key}
          particleEntity={particleEntity}
        />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
