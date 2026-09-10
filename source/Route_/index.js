import { Outlet } from 'react-router';

import Application_ from './Application_';

const Route_ = () => {
  return (
    <Application_>
      <Outlet />
    </Application_>
  );
};

export default Route_;
