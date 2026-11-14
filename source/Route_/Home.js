import { useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import InertiaPlugin from 'gsap/InertiaPlugin';
import random from 'random';

gsap.registerPlugin(useGSAP, PixiPlugin, InertiaPlugin);
PixiPlugin.registerPIXI(pixiJs);

const rowColumnCount = 5;

const padding = 5;

const Sprite_ = ({ texture, pointerPositionDeltaRef }) => {
  useExtend({ LayoutContainer, Sprite });

  const { contextSafe } = useGSAP();

  const ref = useRef(undefined);

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerOverHandle = contextSafe(() => {
    const refCurrentSprite = /** @type {pixiJs.Container} */ (
      ref.current
    ).getChildAt(0);

    gsap
      .timeline({
        defaults: { overwrite: 'auto' }
      })
      .timeScale(1.2)
      .to(refCurrentSprite, {
        inertia: (() => {
          const {
            current: { x, y }
          } = pointerPositionDeltaRef;

          return Object.entries({ x, y }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: /** @type {gsap.InertiaObject} */ ({
                velocity: value * 30,
                end: 0
              })
            }),
            {}
          );
        })()
      })
      .fromTo(
        refCurrentSprite,
        { pixi: { angle: 0 } },
        {
          pixi: { angle: random.int(-15, 15) },
          duration: 0.4,
          repeat: 1,
          yoyo: true,
          ease: 'power1.inOut'
        },
        '<'
      );
  });

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        padding,
        borderWidth: 0,
        borderRadius: 0xffffff
      }}
      eventMode='static'
      cursor='pointer'
      onPointerOver={onPointerOverHandle}
    >
      <pixiSprite texture={texture} layout={{}} />
    </pixiLayoutContainer>
  );
};

const pointerPositionInitial = { x: 0, y: 0 };

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const {
    app: { stage, screen }
  } = useApplication();

  const pointerPositionRef = useRef(pointerPositionInitial);

  const pointerPositionDeltaRef = useRef(pointerPositionInitial);

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/bunny.png').then(textureSet);
  }, []);

  useEffect(() => {
    Object.assign(
      stage,
      /** @type {pixiJs.ContainerOptions} */ ({
        eventMode: 'static',
        hitArea: screen
      })
    );

    /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
    const onPointerMoveHandle = ({ client }) => {
      Object.assign(pointerPositionDeltaRef, {
        current: /** @type {typeof pointerPositionInitial} */ (
          (() => {
            const { x, y } = client;

            const {
              current: { x: _x, y: _y }
            } = pointerPositionRef;

            return { x: x - _x, y: y - _y };
          })()
        )
      });

      Object.assign(pointerPositionRef, {
        current: /** @type {typeof pointerPositionInitial} */ ({ ...client })
      });
    };

    stage.on('pointermove', onPointerMoveHandle);

    return () => {
      stage.off('pointermove', onPointerMoveHandle);
    };
  }, [stage, screen]);

  return (
    texture !== Texture.EMPTY && (
      <pixiLayoutContainer
        layout={{
          ...(() => {
            const { width, height } = texture;

            return Object.entries({ width, height }).reduce(
              (memo, [key, value]) => ({
                ...memo,
                [key]: (value + padding * 2) * rowColumnCount
              }),
              {}
            );
          })(),
          flexWrap: 'wrap',
          borderWidth: 0,
          borderColor: 0x00ff00
        }}
      >
        {Array.from({ length: rowColumnCount ** 2 }).map((_, index) => (
          <Sprite_
            key={index}
            texture={texture}
            pointerPositionDeltaRef={pointerPositionDeltaRef}
          />
        ))}
      </pixiLayoutContainer>
    )
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
