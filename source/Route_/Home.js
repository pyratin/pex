import { useRef, useState, useEffect, memo } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite, Graphics } from 'pixi.js';

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

  return { width: height * (height / 2), height };
})();

const dragDefinitionInitialized = {
  pointerId: undefined,
  offset: { x: undefined, y: undefined }
};

const Control_ = ({ scaleFactorSet }) => {
  useExtend({ LayoutContainer, Graphics });

  const {
    app: { stage, screen }
  } = useApplication();

  const ref = useRef(undefined);

  const dragDefinitionRef = useRef(dragDefinitionInitialized);

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
    const {
      current: { pointerId: _pointerId, offset }
    } = dragDefinitionRef;

    pointerId === _pointerId &&
      (() => {
        const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

        const refCurrentGraphics = /** @type {pixiJs.Graphics} */ (
          refCurrent.getChildAt(0)
        );

        Object.assign(
          refCurrentGraphics,
          /** @type {pixiJs.GraphicsOptions} */ ({
            position: (() => {
              const { width, height } = dimension;

              const x = (() => {
                const { x } = refCurrent.parent.toLocal(global);

                const { x: _x } = offset;

                return Math.max(0, Math.min(x + _x, width - height));
              })();

              scaleFactorSet((x / (width - height) - 0.5) * 2);

              return { x: x, y: 0 };
            })()
          })
        );
      })();
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerDownHandle = ({ pointerId, global, currentTarget }) => {
    Object.assign(dragDefinitionRef, {
      current: /** @type {typeof dragDefinitionInitialized} */ ({
        pointerId,
        offset: (() => {
          const {
            position: { x, y }
          } = currentTarget;

          const { x: _x, y: _y } = currentTarget.parent.toLocal(global);

          return { x: x - _x, y: y - _y };
        })()
      })
    });

    stage.on('pointermove', onPointerMoveHandle);
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerUpHandle = ({ pointerId }) => {
    const {
      current: { pointerId: _pointerId }
    } = dragDefinitionRef;

    pointerId === _pointerId &&
      (() => {
        Object.assign(dragDefinitionRef, {
          current: dragDefinitionInitialized
        });

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
    >
      <pixiGraphics
        label='Graphics_'
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
          marginBottom: 200,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 20,
          borderWidth: 0,
          borderColor: 0x00ff00
        }}
      >
        <pixiLayoutContainer
          layout={{
            justifyContent: 'center',
            alignItems: 'flex-end',
            borderWidth: 0,
            borderColor: 0x0000ff
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
