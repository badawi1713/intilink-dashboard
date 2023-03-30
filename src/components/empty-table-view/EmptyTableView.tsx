import { Typography } from '@mui/material';

const EmptyTableView = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-[240px]">
      <Typography variant="body1" align="center">
        {'Maaf, data tidak tersedia.'}
      </Typography>
    </section>
  );
};

export default EmptyTableView;
