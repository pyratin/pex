import React, { useEffect } from 'react';
import { Stats } from 'pixi-stats';
import { useApplication } from '@pixi/react';

const Stats_ = () => {
  const {
    app: { renderer, ticker }
  } = useApplication();

  useEffect(() => {
    const stats = new Stats(renderer, ticker);

    document.body.appendChild(stats.domElement);

    Object.assign(
      stats.domElement.style,
      /** @type {React.CSSProperties} */ ({
        position: 'absolute',
        bottom: 0,
        left: 0
      })
    );
  }, [renderer, ticker]);

  return null;
};

export default Stats_;
