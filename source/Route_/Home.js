import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';

const dimension = 200;

const Container_ = () => {
  useExtend({ LayoutContainer, Graphics });

  const ref = useRef(undefined);

  useEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    refCurrent.getChildByLabel('Graphics_').setMask({
      mask: refCurrent.getChildByLabel('Graphics__'),
      inverse: true
    });
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        width: dimension,
        height: dimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        label='Graphics_'
        draw={(graphics) =>
          graphics.rect(0, 0, dimension, dimension).fill({ color: 0x00ff00 })
        }
      />

      <pixiGraphics
        label='Graphics__'
        draw={(graphics) =>
          graphics
            .star(dimension / 2, dimension / 2, 5, dimension / 2.5)
            .fill({ color: 0x0000ff })
        }
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
    >
      <Container_ />
    </pixiLayoutContainer>
  );
};

export default Home;
