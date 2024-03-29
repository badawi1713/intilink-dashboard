/* eslint-disable @typescript-eslint/no-unsafe-call */
import { FC, useRef, useState } from 'react';
import { HiMenu } from 'react-icons/hi';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useOnClickOutside } from 'usehooks-ts';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { userLogoutAction } from '../../store/actions/auth-action';
type MenuType = {
  id: number | string;
  title?: string;
  url?: string;
  children?:
    | {
        id: number | string;
        title?: string;
        url?: string;
        children?: any;
      }[]
    | any;
};

interface NavbarProps {
  setOpenAside: () => void;
}

const Navbar: FC<NavbarProps> = (props) => {
  const { setOpenAside } = props;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user } = useAppSelector((state) => state.authReducer);

  const [childrenMenu, setChildrenMenu] = useState([]);
  const [subChildrenMenu, setSubChildrenMenu] = useState([]);

  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  const profileMenuRef = useRef(null);

  const handleClickOutside = () => {
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    dispatch(userLogoutAction());
    navigate('/');
  };

  useOnClickOutside(profileMenuRef, handleClickOutside);

  return (
    <header className="flex flex-col-reverse xl:flex-row items-start">
      <nav className="flex flex-col gap-5 items-start flex-1">
        <section className="flex overflow-hidden hover:overflow-auto w-full max-w-[100%] flex-shrink md:max-w-full xl:max-w-full snap-x snap-mandatory">
          {typeof user?.dashboardMenu === 'object' &&
            user?.dashboardMenu?.length > 0 &&
            user?.dashboardMenu?.map((menu: MenuType) => {
              return (
                <NavLink
                  to={menu?.url || ''}
                  onClick={() => {
                    setChildrenMenu(menu?.children || []);
                    setSubChildrenMenu([]);
                  }}
                  key={menu.id}
                  className={({ isActive }: any) =>
                    (isActive ? 'border-blue-400 border-b-2' : 'border-slate-500 border-b') +
                    ' cursor-pointer flex items-center justify-center p-4 flex-shrink-0 snap-start'
                  }
                >
                  {({ isActive }) => (
                    <p className={`${isActive ? 'text-blue-400' : 'text-slate-500'} text-lg`}>{menu.title}</p>
                  )}
                </NavLink>
              );
            })}
        </section>
        <section className="flex overflow-hidden hover:overflow-auto w-full max-w-[70%] flex-shrink md:max-w-full xl:max-w-2xl snap-x snap-mandatory">
          {typeof childrenMenu === 'object' &&
            childrenMenu?.length > 0 &&
            childrenMenu?.map((menu: MenuType) => {
              return (
                <NavLink
                  to={menu?.url || ''}
                  onClick={() => {
                    setSubChildrenMenu(menu?.children || []);
                  }}
                  key={menu.id}
                  className={({ isActive }: any) =>
                    (isActive ? 'border-blue-400 border-b-2' : 'border-slate-500 border-b') +
                    ' cursor-pointer flex items-center justify-center p-4 flex-shrink-0 snap-start'
                  }
                >
                  {({ isActive }) => (
                    <p className={`${isActive ? 'text-blue-400' : 'text-slate-500'} text-base`}>{menu.title}</p>
                  )}
                </NavLink>
              );
            })}
        </section>
        <section className="flex overflow-hidden hover:overflow-auto w-full max-w-[70%] flex-shrink md:max-w-full xl:max-w-2xl snap-x snap-mandatory">
          {typeof subChildrenMenu === 'object' &&
            subChildrenMenu?.length > 0 &&
            subChildrenMenu?.map((menu: MenuType) => {
              return (
                <NavLink
                  to={menu?.url || ''}
                  key={menu.id}
                  className={({ isActive }: any) =>
                    (isActive ? 'border-blue-400 border-b-2' : 'border-slate-500 border-b') +
                    ' cursor-pointer flex items-center justify-center p-4 flex-shrink-0 snap-start'
                  }
                >
                  {({ isActive }) => (
                    <p className={`${isActive ? 'text-blue-400' : 'text-slate-500'} text-sm`}>{menu.title}</p>
                  )}
                </NavLink>
              );
            })}
        </section>
      </nav>
      <section className="p-4 xl:ml-auto flex justify-between gap-4 items-center w-full xl:w-auto">
        <button
          onClick={setOpenAside}
          className="flex border-2 border-slate-900 w-8 h-8 rounded-md xl:hidden items-center justify-center"
        >
          <HiMenu size={20} />
        </button>
        <div ref={profileMenuRef} className="ml-auto relative inline-block text-left">
          <button
            onClick={() => setShowProfileMenu((prevState: any) => !prevState)}
            id="menu-button"
            aria-expanded="true"
            aria-haspopup="true"
            type="button"
            className="flex gap-2 items-start"
          >
            <img
              alt="avatar"
              src="https://source.boringavatars.com/beam/120/Stefan?colors=264653,f4a261,e76f51"
              className="w-12 h-12 bg-slate-500 rounded-full aspect-square"
            />
            <div>
              <h5 className="font-semibold text-left">{user?.nama}</h5>
              <p className="font-medium text-green-500 text-left">Online</p>
            </div>
          </button>
          {showProfileMenu && (
            <div
              className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabIndex={-1}
            >
              <div className="py-1" role="none">
                <a
                  onClick={() => setShowProfileMenu(false)}
                  href="#"
                  className="text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-0"
                >
                  Profil
                </a>
                <a
                  onClick={() => setShowProfileMenu(false)}
                  href="#"
                  className="text-gray-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-1"
                >
                  Ubah Password
                </a>
              </div>
              <div className="py-1" role="none">
                <button
                  onClick={handleLogout}
                  className="text-red-700 block px-4 py-2 text-sm"
                  role="menuitem"
                  tabIndex={-1}
                  id="menu-item-2"
                >
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </header>
  );
};

export default Navbar;
