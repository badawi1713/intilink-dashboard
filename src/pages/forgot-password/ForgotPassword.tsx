
const ForgotPassword = () => {
	return (
		<main className=" flex lg:justify-center lg:items-center min-h-screen w-full bg-indigo-50 lg:p-20">
			<div className="mx-auto bg-white p-6 lg:rounded-xl w-full sm:max-w-[500px] my-auto h-screen sm:h-full">
				<main className="flex flex-col">
					<header className="flex flex-col items-center mb-10">
						<img
							className="w-[150px] h-[92px] mx-auto"
							alt="intilink-logo"
							loading="lazy"
							src="assets/images/img-logo.png"
						/>
						<h2 className="mb-2 mt-4 text-lg font-bold text-black">
							Lupa Password
						</h2>
						<p className="text-center text-gray-500 text-sm">
              Masukkan email/no.whatsapp yang  <br/> terhubung dengan akun, supaya sistem <br/> mengirim instruksi password baru.
						</p>
					</header>

					<form>
						<div className="flex flex-col gap-3 mb-4">
							<label className="text-sm font-semibold">Email/No. Whatsapp</label>
							<input
								className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
								placeholder="Email/No. Whatsapp"
							/>
						</div>
						<button className="w-full bg-green-600 border-2 border-green-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold mb-6">
							Kirim
						</button>
					</form>
				</main>
			</div>
		</main>
	);
};

export default ForgotPassword;
