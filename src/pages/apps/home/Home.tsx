const Home = () => {
    return (
        <>
            <section className="p-4 bg-gray-200 w-full rounded-md">
                <div className="flex flex-col xl:flex-row gap-4">
                    <input
                        className="rounded-md px-3 py-2 border-2 border-gray-600 w-full xl:max-w-[160px]"
                        type="date"
                    />
                    <select
                        className="rounded-md px-3 py-2 border-2 border-gray-600 w-full xl:max-w-[160px]"
                        name="status"
                        id="status"
                    >
                        <option value="">Status</option>
                        <option value="all">Semua</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                    </select>
                    <select
                        className="rounded-md px-3 py-2 border-2 border-gray-600 w-full xl:max-w-[160px]"
                        name="category"
                        id="category"
                    >
                        <option value="">Kategori</option>
                        <option value="1">Produk</option>
                    </select>
                </div>
            </section>
            <main>
                <div className="flex justify-between gap-4 items-center">
                    <div>
                        <h3 className="font-bold text-xl">Dashboard</h3>
                        <h6 className="text-lg">Welcome to dashboard</h6>
                    </div>
                    <button className="w-auto bg-blue-600 border-2 border-blue-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold">
                        Tambah Data
                    </button>
                </div>
            </main>
        </>
    );
};

export default Home;
