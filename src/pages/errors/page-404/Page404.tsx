import { Link } from 'react-router-dom';

const Page404 = () => {
  return (
    <div className="w-full flex-1 bg-white rounded-md p-10 flex flex-col justify-center items-center">
      <img
        alt="not-found-404"
        className=" w-60 h-60 "
        src={`${window.location.origin}/assets/illustrator/ill-page_404.svg`}
      />
      <h3 className="font-semibold">404. Halaman tidak ditemukan</h3>
      <Link to="/">
        <button className="p-2 w-40 text-white bg-blue-500 rounded-md mt-8">Kembali</button>
      </Link>
    </div>
  );
};

export default Page404;
