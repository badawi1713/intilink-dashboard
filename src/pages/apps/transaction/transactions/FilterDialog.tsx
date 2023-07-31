import { yupResolver } from '@hookform/resolvers/yup';
import { CalendarMonth } from '@mui/icons-material';
import {
  AppBar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import moment from 'moment';
import { useMemo } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { handleGetTransactionsData } from 'src/store/actions/transactions-action/transactions-action';
import {
  setTransactionsEndDate,
  setTransactionsFilterType,
  setTransactionsStartDate,
} from 'src/store/slices/transaction-slice/transactions-slice';
import * as yup from 'yup';

const TODAY = new Date();
const DATE = new Date();
const YESTERDAY = DATE.setDate(DATE.getDate() - 1);

const schema = yup.object().shape({
  startDate: yup
    .date()
    .typeError('Diharuskan untuk mengisi tanggal mulai.')
    .required('Diharuskan untuk mengisi tanggal mulai.'),
  endDate: yup
    .date()
    .typeError('Diharuskan untuk mengisi tanggal berakhir.')
    .required('Diharuskan untuk mengisi tanggal berakhir.'),
});

type FilterDialogType = {
  open: boolean;
  closeDialogHandler: () => void;
};

function FilterDialog({ open, closeDialogHandler }: FilterDialogType) {
  const dispatch = useAppDispatch();
  const { loading, startDate, endDate, filterType } = useAppSelector((state) => state.transactionsReducer);
  // console.log(startDate);
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: useMemo(() => {
      return {
        startDate: moment(startDate).format('YYYY-MM-DD HH:mm'),
        endDate: moment(endDate).format('YYYY-MM-DD HH:mm'),
        filterType,
      };
    }, []),
    resolver: yupResolver(schema),
  });

  const { control, formState, reset, handleSubmit } = formMethods;
  const { errors, isValid } = formState;

  const selectedStartDate = useWatch({ control, name: 'startDate' });
  const selectedEndDate = useWatch({ control, name: 'endDate' });

  const handleFilter = handleSubmit((data) => {
    dispatch(setTransactionsEndDate(data.endDate));
    dispatch(setTransactionsStartDate(data.startDate));
    dispatch(setTransactionsFilterType(data.filterType));

    dispatch(handleGetTransactionsData());
    closeDialogHandler();
  });

  return (
    <FormProvider {...formMethods}>
      <Dialog open={open} maxWidth="md" fullWidth>
        <AppBar position="static" elevation={1}>
          <Toolbar className="flex w-full">
            <Typography variant="h6" color="inherit">
              Filter Data Transaksi
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <section className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:items-stretch">
              <Controller
                name="startDate"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      onChange(e);
                    }}
                    error={!!errors.startDate}
                    label="Tanggal mulai"
                    id="startDate"
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    helperText={errors?.startDate?.message || (!selectedStartDate && 'Isi tanggal mulai.')}
                    placeholder="Tanggal Mulai"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Controller
                name="endDate"
                control={control}
                render={({ field: { onChange, ...field } }) => (
                  <TextField
                    {...field}
                    onChange={(e) => {
                      onChange(e);
                    }}
                    error={!!errors.endDate}
                    label="Tanggal berakhir"
                    id="endDate"
                    variant="outlined"
                    fullWidth
                    type="datetime-local"
                    helperText={errors?.endDate?.message || (!selectedEndDate && 'Isi tanggal berakhir.')}
                    placeholder="Tanggal Berakhir"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarMonth />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 md:items-stretch">
              <Controller
                control={control}
                name="filterType"
                render={({ field }) => (
                  <FormControl error={!!errors.filterType} required fullWidth>
                    <InputLabel id="filterType">Tipe Filter</InputLabel>
                    <Select
                      labelId="filterType"
                      input={<OutlinedInput label="Tipe Filter" />}
                      id="filterType"
                      placeholder=":: Pilih tipe filter"
                      {...field}
                      variant="outlined"
                      fullWidth
                    >
                      <MenuItem disabled value="">
                        <em>Pilih tipe filter</em>
                      </MenuItem>
                      {[
                        { id: 'all', label: 'Semua' },
                        { id: 'cek', label: 'Cek' },
                        { id: 'bayar', label: 'Bayar' },
                      ].map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{errors?.filterType?.message}</FormHelperText>
                  </FormControl>
                )}
              />
            </div>
          </section>
        </DialogContent>
        <DialogActions className="justify-between flex w-full">
          <Button
            variant="outlined"
            color="error"
            onClick={() =>
              reset({
                startDate: moment(YESTERDAY).format('YYYY-MM-DD HH:mm'),
                endDate: moment(TODAY).format('YYYY-MM-DD HH:mm'),
                filterType: 'all',
              })
            }
            aria-label="reset-filter"
          >
            Reset Filter
          </Button>
          <div className="flex items-center gap-4 ml-auto">
            <Button onClick={closeDialogHandler} aria-label="tutup">
              Tutup
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              aria-label="tampilkan data"
              onClick={handleFilter}
              disabled={!isValid || loading}
            >
              Simpan
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
}

export default FilterDialog;
