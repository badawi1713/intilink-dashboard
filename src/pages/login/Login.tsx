import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { loginUserAction } from '../../store/actions/auth-action';

const loginSchema = yup.object().shape({
  id: yup.string().required('Diharuskan untuk mengisi email/no. telepon'),
  password: yup.string().required('Diharuskan untuk mengisi password'),
});
const Login = () => {
  const dispatch = useAppDispatch();
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: { id: '', password: '' },
    resolver: yupResolver(loginSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = formMethods;

  const onSubmit = handleSubmit(async (data) => {
    await dispatch(loginUserAction(data));
  });

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
            <h2 className="mb-2 mt-4 text-lg font-bold text-black">Admin Login</h2>
            <p className="text-center text-gray-500 text-sm">
              Selamat datang, silakan masukkan data <br /> untuk dapat mengakses akun Anda.
            </p>
          </header>

          <form onSubmit={onSubmit}>
            <Controller
              control={control}
              name="id"
              render={({ field }) => (
                <div className="flex flex-col gap-3 mb-4">
                  <label className="text-sm font-semibold">Email/No. Telepon</label>
                  <input
                    {...field}
                    className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
                    placeholder="Email/No. Telepon"
                  />
                  {errors?.id && <p className="text-red-600 text-sm">{errors?.id?.message}</p>}
                </div>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <div className="flex flex-col gap-3 mb-7">
                  <label className="text-sm font-semibold">Password</label>
                  <input
                    {...field}
                    className="w-full rounded-md px-3 py-2 border-2 border-gray-600"
                    placeholder="Password"
                    type="password"
                  />
                  {errors?.password && <p className="text-red-600 text-sm">{errors?.password?.message}</p>}
                </div>
              )}
            />

            <button
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-green-600 border-2 border-green-600 disabled:bg-gray-600 disabled:border-gray-600 px-3 py-2 rounded-md text-white text-center text-sm font-semibold"
            >
              {isSubmitting ? 'Memproses' : 'Login'}
            </button>
          </form>

          <section className="text-center p-8 md:p-0 md:mt-8">
            <Link to="/forgot-password" className="text-green-600 cursor-pointer">
              Lupa Password?
            </Link>
          </section>
        </main>
      </div>
    </main>
  );
};

export default Login;
