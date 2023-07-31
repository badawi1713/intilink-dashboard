import { Button, Typography } from '@mui/material';
import { FC } from 'react';

type ErrorViewProps = {
  message: string;
  handleRetry: () => void;
};

const ErrorView: FC<ErrorViewProps> = ({ message, handleRetry }) => {
  return (
    <section className="flex flex-col justify-center items-center min-h-[240px] gap-4">
      <Typography color={'red'} variant="body1" align="center">
        {message || 'Maaf, sedang terjadi kesalahan. Silahkan coba kembali.'}
      </Typography>
      <Button size="small" color="inherit" variant="outlined" onClick={handleRetry}>
        Coba Kembali
      </Button>
    </section>
  );
};

export default ErrorView;
