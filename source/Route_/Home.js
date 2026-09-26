import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Graphics });

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
      scale={5}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .moveTo(0, 0)
            .lineTo(-10, -10)
            .moveTo(0, 0)
            .lineTo(-10, 10)
            .moveTo(0, 0)
            .lineTo(-30, 0)
            .stroke({ width: 4, color: 0x00ff00 })
        }
        layout={{}}
      />
    </pixiLayoutContainer>
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
        borderWidth: 1,
        borderColor: 0xff0000
      }}
      eventMode='static'
      cursor='pointer'
      onPointerMove={
        /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
        ({ client, currentTarget }) => {
          const element = currentTarget.getChildAt(0);

          Object.assign(
            element,
            /** @type {pixiJs.ContainerOptions} */ ({
              rotation: (() => {
                const { x, y } = client;

                const {
                  layout: { realX, realY }
                } = element;

                return Math.atan2(y - realY, x - realX);
              })()
            })
          );
        }
      }
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
