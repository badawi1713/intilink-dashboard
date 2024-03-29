import { Link } from 'react-router-dom';

const ResetPassword = () => {
  return (
    <main className=" flex xl:justify-center xl:items-center min-h-screen w-full bg-indigo-50 xl:p-20">
      <div className="mx-auto bg-white p-6 xl:rounded-xl w-full sm:max-w-[500px] my-auto h-screen sm:h-full">
        <main className="flex flex-col">
          <header className="flex flex-col items-center mb-10">
            <img
              className="w-[150px] h-[92px] mx-auto"
              alt="intilink-logo"
              loading="lazy"
              src="assets/images/img-logo.png"
            />
            <h2 className="mb-2 mt-4 text-lg font-bold text-black">Password Baru</h2>
            <p className="text-center text-gray-500 text-sm">Atur ulang password Anda.</p>
          </header>

          <form>
            <div className="flex flex-col gap-3 mb-7">
              <label className="text-sm font-semibold">Password</label>
              <input
                className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
                placeholder="Password"
                type="password"
              />
            </div>
            <div className="flex flex-col gap-3 mb-7">
              <label className="text-sm font-semibold">Konfirmasi Password</label>
              <input
                className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
                placeholder="Password"
                type="password"
              />
            </div>
            <button className="w-full bg-green-600 border-2 border-green-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold">
              Kirim
            </button>
          </form>

          <section className="text-center p-8 md:p-0 md:mt-8">
            <Link to="/" className="text-green-600 cursor-pointer">
              Login
            </Link>
          </section>
        </main>
      </div>
    </main>
  );
};

export default ResetPassword;
