import { useRef } from 'react';

const Aside = ({ openAside, setOpenAside }: any) => {
  const asideRef = useRef(null);

  const handleClickOutside = () => {
    setOpenAside(false);
  };

  return (
    <>
      {openAside && (
        <>
          <div
            onClick={handleClickOutside}
            className="z-10 absolute xl:hidden w-full h-full bg-black bg-opacity-50"
          />
          <aside
            ref={asideRef}
            className="absolute z-20 xl:sticky px-10 py-16 bg-white shadow-lg w-full max-w-xs xl:max-w-full border min-h-full"
          >
            <img
              alt="intilink-logo"
              src={`${window.location.origin}/assets/images/img-logo.png`}
              className="w-32 h-16 mb-8"
            />
            <section className="flex flex-col gap-6 items-start">
              <button onClick={() => setOpenAside(false)} className="w-auto">
                <h2 className="font-semibold">Add Sender</h2>
              </button>
              <h2>Whatsapp Sender</h2>
              <ul className="flex flex-col gap-4">
                <li className="text-green-500 font-medium">
                  +62 812 5388 9122
                </li>
              </ul>
            </section>
          </aside>
        </>
      )}
    </>
  );
};

export default Aside;
