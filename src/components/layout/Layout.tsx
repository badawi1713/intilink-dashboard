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
    <div className="min-h-screen flex relative overflow-x-hidden">
      <div className="overflow-auto w-0 xl:w-[300px]">
        <Aside setOpenAside={setOpenAside} openAside={openAside} />
      </div>
      <div className="p-5 bg-slate-100 w-full flex flex-col gap-6 min-h-screen">
        <Navbar setOpenAside={setOpenAside} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
