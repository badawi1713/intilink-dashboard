import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginUserAction } from '../../store/actions/auth-action';

const loginSchema = yup.object().shape({
	id: yup.string().required('Email is required'),
	password: yup.string().required('Password is required'),
});
const Login = () => {

	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { loading } = useAppSelector((state) => state.authReducer);
	const formMethods = useForm({
		mode: 'onChange',
		defaultValues: { id: '', password: '' },
		resolver: yupResolver(loginSchema),
	});

	const [showPassword, setShowPassword] = useState(false);

	const {
		control, formState, handleSubmit,
	} = formMethods;
	const { errors } = formState;

	const onSubmit = handleSubmit(async (data) => {
		const response = await dispatch(loginUserAction(data));
		if (response) {
			navigate('/', { replace: true });
		}
	});

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
							Admin Login
						</h2>
						<p className="text-center text-gray-500 text-sm">
							Selamat datang, silakan masukkan data <br /> untuk dapat mengakses
							akun Anda.
						</p>
					</header>

					<form onSubmit={onSubmit}>
						<Controller control={control} name="id" render={({ field }) => (
							<div className="flex flex-col gap-3 mb-4">
								<label className="text-sm font-semibold">Email/No. Telepon</label>
								<input
									{...field}
									className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
									placeholder="Email/No. Telepon"
								/>
							</div>
						)} />
						<Controller control={control} name="password" render={({ field }) => (
							<div className="flex flex-col gap-3 mb-7">
								<label className="text-sm font-semibold">Password</label>
								<input
									{...field}
									className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
									placeholder="Password"
									type="password"
								/>
							</div>
						)} />

						<button type="submit" className="w-full bg-green-600 border-2 border-green-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold">
							Login
						</button>
					</form>

					<section className="text-center p-8 md:p-0 md:mt-8">
						<Link to='/forgot-password' className="text-green-600 cursor-pointer">
							Lupa Password?
						</Link>
					</section>
				</main>
			</div>
		</main>
	);
};

export default Login;
