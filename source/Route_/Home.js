import { useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite, Graphics } from 'pixi.js';

const Sprite_ = ({ scaleFactor }) => {
  useExtend({ LayoutContainer, Sprite });

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/bunny.png').then((texture) => {
      Object.assign(
        texture.source,
        /** @type {pixiJs.TextureSourceOptions} */ ({
          scaleMode: 'nearest',
          resolution: 1 / 3
        })
      );

      /** @type {pixiJs.Texture} */ (texture).update();

      textureSet(texture);
    });
  }, []);

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 1,
        borderColor: 0xffffff
      }}
    >
      <pixiSprite
        texture={texture}
        layout={{
          ...(() => {
            const { width, height } = texture;

            return Object.entries({ width, height }).reduce(
              (memo, [key, value]) => ({
                ...memo,
                [key]: value * (scaleFactor + 1) + value
              }),
              {}
            );
          })()
        }}
      />
    </pixiLayoutContainer>
  );
};

const dimension = (() => {
  const height = 24;

  return { width: height * (height * 0.5), height };
})();

const Control = ({ scaleFactorSet }) => {
  useExtend({ LayoutContainer, Graphics });

  const {
    app: { stage, screen }
  } = useApplication();

  const ref = useRef(undefined);

  const pointerIdRef = useRef(undefined);

  const positionInitializedFlagRef = useRef(false);

  useEffect(() => {
    Object.assign(
      stage,
      /** @type {pixiJs.ContainerOptions} */ ({
        eventMode: 'static',
        hitArea: screen
      })
    );
  }, [stage, screen]);

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerMoveHandle = ({ pointerId, global }) => {
    const { current: _pointerId } = pointerIdRef;

    pointerId === _pointerId &&
      (() => {
        const element = /** @type {pixiJs.Container} */ (
          ref.current
        ).getChildAt(1);

        Object.assign(
          element,
          /** @type {pixiJs.ContainerOptions} */ ({
            position: (() => {
              const { x: _x } = element.parent.toLocal(global);

              const { width, height } = dimension;

              const x = Math.max(0, Math.min(_x, width - height));

              scaleFactorSet((x / (width - height) - 0.5) * 2);

              return { x, y: 0 };
            })()
          })
        );
      })();
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerDownHandle = ({ pointerId }) => {
    Object.assign(pointerIdRef, { current: pointerId });

    stage.on('pointermove', onPointerMoveHandle);
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerUpHandle = () => {};

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .rect(
              ...(() => {
                const { width, height } = dimension;

                return /** @type {const} */ ([0, 0, width, height]);
              })()
            )
            .stroke({ width: 1, color: 0xffffff, alignment: 1 })
        }
        layout={{}}
      />

      <pixiLayoutContainer
        layout={{
          position: 'absolute',
          borderWidth: 0,
          borderColor: 0x0000ff
        }}
        {...(!positionInitializedFlagRef.current && {
          position: (() => {
            Object.assign(positionInitializedFlagRef, { current: true });

            const { width, height } = dimension;

            return { x: (width - height) * 0.5, y: 0 };
          })()
        })}
        alpha={0.75}
        eventMode='static'
        cursor='pointer'
        onPointerDown={onPointerDownHandle}
        onPointerUp={onPointerUpHandle}
        onPointerUpOutside={onPointerUpHandle}
      >
        <pixiGraphics
          draw={(graphics) =>
            graphics
              .rect(
                ...(() => {
                  const { height } = dimension;

                  return /** @type {const} */ ([0, 0, height, height]);
                })()
              )
              .fill({ color: 0xffffff })
          }
          layout={{}}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const [scaleFactor, scaleFactorSet] = useState(0);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 20,
        marginBottom: '25%',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <Sprite_ scaleFactor={scaleFactor} />

      <Control scaleFactorSet={scaleFactorSet} />
    </pixiLayoutContainer>
  );
};

export default Home;
