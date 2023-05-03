import { useLayoutEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import Aside from '../aside';
import Navbar from '../navbar';

const Layout = () => {
  const { width } = useWindowSize();
  const [openAside, setOpenAside] = useState<boolean>(true);

  useLayoutEffect(() => {
    if (width < 1280) {
      setOpenAside(false);
    } else {
      setOpenAside(true);
    }
  }, [width]);

  return (
    <div className="min-h-screen grid grid-cols-1 xl:grid-cols-12 relative overflow-x-hidden">
      <div className="col-span-none xl:col-span-3 2xl:col-span-2 h-full overflow-auto">
        <Aside setOpenAside={setOpenAside} openAside={openAside} />
      </div>
      <div className="p-5 bg-slate-100 w-full flex flex-col gap-6 col-span-1 xl:col-span-9 2xl:col-span-10 min-h-screen">
        <Navbar setOpenAside={setOpenAside} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
