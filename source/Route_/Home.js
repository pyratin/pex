import { useRef, useState, useEffect, memo } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Graphics, Sprite } from 'pixi.js';

const Sprite_ = ({ scaleFactor }) => {
  useExtend({ Sprite });

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
    <pixiSprite
      texture={texture}
      layout={{
        ...(() => {
          const { width, height } = texture;

          return Object.entries({ width, height }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: value + value * (scaleFactor + 1)
            }),
            {}
          );
        })()
      }}
    />
  );
};

const dimension = (() => {
  const height = 24;

  return { width: height * 20, height };
})();

const Control_ = ({ scaleFactorSet }) => {
  useExtend({ LayoutContainer, Graphics });

  const {
    app: { stage, screen }
  } = useApplication();

  const ref = useRef(undefined);

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

              const {
                position: { y }
              } = refCurrentGraphics;

              return { x, y };
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
        borderColor: 0x00ff00
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
            .fill({ color: 0x00ff00 })
        }
        position={(() => {
          const { width, height } = dimension;

          return { x: (width - height) / 2, y: 0 };
        })()}
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

const Control = memo(Control_);

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
          marginBottom: 100,
          borderWidth: 0,
          borderColor: 0x00ff00
        }}
      >
        <pixiLayoutContainer
          layout={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
            marginBottom: 20,
            borderWidth: 0,
            borderColor: 0xff0000
          }}
        >
          <Sprite_ scaleFactor={scaleFactor} />
        </pixiLayoutContainer>

        <pixiLayoutContainer
          layout={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            borderWidth: 0,
            borderColor: 0x0000ff
          }}
        >
          <Control scaleFactorSet={scaleFactorSet} />
        </pixiLayoutContainer>
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

export default Home;
