import React, { useEffect } from 'react';
import { useApplication } from '@pixi/react';
import { Stats } from 'pixi-stats';

const Stats_ = () => {
  const {
    app: { renderer, ticker }
  } = useApplication();

  useEffect(() => {
    const stats = new Stats(renderer, ticker);

    Object.assign(
      stats.domElement.style,
      /** @type {React.CSSProperties} */ ({
        position: 'absolute',
        bottom: 0
      })
    );

    document.body.appendChild(stats.domElement);
  }, [renderer, ticker]);

  return null;
};

export default Stats_;
