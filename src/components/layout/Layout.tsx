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
    <div className="min-h-screen flex relative">
      <div className="overflow-auto w-0 xl:w-[300px] shrink-0">
        <Aside setOpenAside={() => setOpenAside((prevState) => !prevState)} openAside={openAside} />
      </div>
      <div className="p-5 bg-slate-100 flex flex-col flex-1 overflow-auto gap-6">
        <Navbar setOpenAside={() => setOpenAside((prevState) => !prevState)} />
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
