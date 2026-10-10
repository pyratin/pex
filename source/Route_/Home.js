import { useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite, Graphics } from 'pixi.js';

const Sprite_ = ({ scaleFactor }) => {
  useExtend({ LayoutContainer, Sprite });

  const ref = useRef(undefined);

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
      ref={ref}
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

  const layoutInitializedFlagRef = useRef(false);

  const pointerIdRef = useRef(undefined);

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
        const refCurrentGraphics = /** @type {pixiJs.Container} */ (
          ref.current
        ).getChildAt(0);

        Object.assign(
          refCurrentGraphics,
          /** @type {pixiJs.ContainerOptions} */ ({
            position: (() => {
              const { x: _x } = refCurrentGraphics.parent.toLocal(global);

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
  const onPointerUpHandle = ({ pointerId }) => {
    const { current: _pointerId } = pointerIdRef;

    pointerId === _pointerId &&
      (() => {
        Object.assign(pointerIdRef, { current: undefined });

        stage.off('pointermove', onPointerMoveHandle);
      })();
  };

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        ...dimension,
        borderWidth: 1,
        borderColor: 0xffffff
      }}
      onLayout={({ target }) => {
        !layoutInitializedFlagRef.current &&
          (() => {
            Object.assign(
              target.getChildAt(0),
              /** @type {pixiJs.ContainerOptions} */ ({
                position: (() => {
                  const { width, height } = target;

                  return { x: (width - height) * 0.5, y: 0 };
                })()
              })
            );

            Object.assign(layoutInitializedFlagRef, { current: target });
          })();
      }}
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
        alpha={0.75}
        eventMode='static'
        cursor='pointer'
        onPointerDown={onPointerDownHandle}
        onPointerUp={onPointerUpHandle}
        onPointerUpOutside={onPointerUpHandle}
      />
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
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
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
    </pixiLayoutContainer>
  );
};

export default Home;
